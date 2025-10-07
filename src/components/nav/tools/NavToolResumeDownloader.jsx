import React, { useEffect, useState } from "react";
import { useLanguage } from "/src/providers/LanguageProvider.jsx";
import { useUtils } from "/src/hooks/utils.js";
import OptionPickerButton from "/src/components/buttons/OptionPickerButton.jsx";
import { useData } from "/src/providers/DataProvider.jsx";
import { useFeedbacks } from "/src/providers/FeedbacksProvider.jsx";
import { useStrapiApi } from "/src/hooks/strapiApi.js";

function NavToolResumeDownloader() {
  const language = useLanguage();
  const utils = useUtils();
  const data = useData();
  const feedbacks = useFeedbacks();
  const { fetchResume } = useStrapiApi();

  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(false);

  const id = "download_resume";
  const tooltip = language.getString("download_resume");

  const options = [
    {
      id: id,
      faIcon: "fa-solid fa-file-arrow-down",
      label: tooltip,
    },
  ];

  // Fetch resume data on component mount
  useEffect(() => {
    const loadResume = async () => {
      setLoading(true);
      try {
        const response = await fetchResume();
        if (response.success && response.data) {
          setResumeData(response.data);
        }
      } catch (error) {
        console.error("Error loading resume:", error);
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [fetchResume]);

  const _onClick = async () => {
    if (loading) {
      feedbacks.displayNotification(
        language.getString("error"),
        "Loading resume...",
        "info"
      );
      return;
    }

    if (!resumeData?.my_cv?.url) {
      feedbacks.displayNotification(
        language.getString("error"),
        language.getString("error_file_not_found"),
        "error"
      );
      return;
    }

    try {
      utils.file.download(resumeData.my_cv.url);
    } catch (error) {
      feedbacks.displayNotification(
        language.getString("error"),
        "Failed to download resume",
        "error"
      );
    }
  };

  return (
    <OptionPickerButton
      mode={OptionPickerButton.Modes.MODE_BUTTON}
      options={options}
      selectedOptionId={id}
      onOptionSelected={_onClick}
      tooltipLabel={tooltip}
    />
  );
}

export default NavToolResumeDownloader;
