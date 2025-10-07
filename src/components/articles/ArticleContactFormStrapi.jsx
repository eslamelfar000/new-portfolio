import "./ArticleContactForm.scss";
import React, { useEffect, useState } from "react";
import { useConstants } from "/src/hooks/constants.js";
import { useData } from "/src/providers/DataProvider.jsx";
import { useFeedbacks } from "/src/providers/FeedbacksProvider.jsx";
import { useLanguage } from "/src/providers/LanguageProvider.jsx";
import { useNavigation } from "/src/providers/NavigationProvider.jsx";
import { useUtils } from "/src/hooks/utils.js";
import { useStrapiApi } from "/src/hooks/strapiApi.js";
import Article from "/src/components/articles/base/Article.jsx";
import {
  RowForm,
  RowFormGroup,
  RowFormGroupAlert,
  RowFormGroupItem,
  RowFormGroupSubmit,
} from "/src/components/forms/containers/RowForm.jsx";
import {
  MessageCard,
  MessageCardIcon,
  MessageCardBody,
  MessageCardFooter,
} from "/src/components/generic/MessageCard.jsx";
import Input from "/src/components/forms/fields/Input.jsx";
import Textarea from "/src/components/forms/fields/Textarea.jsx";
import StandardButton from "/src/components/buttons/StandardButton.jsx";

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {Number} id
 * @return {JSX.Element}
 * @constructor
 */
function ArticleContactFormStrapi({ dataWrapper, id }) {
  const [selectedItemCategoryId, setSelectedItemCategoryId] = useState(null);
  const [shouldHideTitle, setShouldHideTitle] = useState(false);

  return (
    <Article
      id={dataWrapper.uniqueId}
      type={Article.Types.SPACING_DEFAULT}
      dataWrapper={dataWrapper}
      forceHideTitle={shouldHideTitle}
      className={`article-contact-form-strapi`}
      selectedItemCategoryId={selectedItemCategoryId}
      setSelectedItemCategoryId={setSelectedItemCategoryId}
    >
      <ArticleContactFormStrapiContent
        dataWrapper={dataWrapper}
        selectedItemCategoryId={selectedItemCategoryId}
        setShouldHideTitle={setShouldHideTitle}
      />
    </Article>
  );
}

ArticleContactFormStrapi.Status = {
  WAITING_FOR_SUBMISSION: "waiting-for-submission",
  SUBMITTING: "submitting",
  SUBMITTED: "submitted",
};

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {String} selectedItemCategoryId
 * @param {Function} setShouldHideTitle
 * @return {JSX.Element}
 * @constructor
 */
function ArticleContactFormStrapiContent({
  dataWrapper,
  selectedItemCategoryId,
  setShouldHideTitle,
}) {
  const constants = useConstants();
  const data = useData();
  const feedbacks = useFeedbacks();
  const language = useLanguage();
  const navigation = useNavigation();
  const utils = useUtils();
  const { submitContactForm } = useStrapiApi();

  const id = "contact-form-strapi";
  const windowStatus = utils.storage.getWindowVariable(id);

  const [fieldsBundle, setFieldsBundle] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [status, setStatus] = useState(
    windowStatus || ArticleContactFormStrapi.Status.WAITING_FOR_SUBMISSION
  );

  const name = fieldsBundle?.name;
  const email = fieldsBundle?.email;
  const subject = fieldsBundle?.subject;
  const message = fieldsBundle?.message;
  const emailDisplay = utils.storage.getWindowVariable(id + "-email");
  const didSubmit = status === ArticleContactFormStrapi.Status.SUBMITTED;

  const errorMessage = validationError
    ? language
        .getString(validationError.errorCode)
        .replace("{x}", validationError.errorParameter)
    : null;

  useEffect(() => {
    const form = document.getElementById(id);

    switch (status) {
      case ArticleContactFormStrapi.Status.WAITING_FOR_SUBMISSION:
        form?.reset();
        utils.storage.setWindowVariable(id, null);
        utils.storage.setWindowVariable(id + "-email", null);
        setShouldHideTitle(false);
        break;

      case ArticleContactFormStrapi.Status.SUBMITTED:
        utils.storage.setWindowVariable(
          id,
          ArticleContactFormStrapi.Status.SUBMITTED
        );
        if (email) utils.storage.setWindowVariable(id + "-email", email);
        setShouldHideTitle(true);
        break;
    }
  }, [status]);

  const _onReset = () => {
    setShouldHideTitle(false);
    setStatus(ArticleContactFormStrapi.Status.WAITING_FOR_SUBMISSION);
  };

  const _onSubmit = async (e) => {
    if (status !== ArticleContactFormStrapi.Status.WAITING_FOR_SUBMISSION)
      return;

    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
    navigation.forceScrollToTop();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      feedbacks.setActivitySpinnerVisible(
        true,
        dataWrapper.uniqueId,
        language.getString("sending_message")
      );
      setTimeout(() => {
        setValidationError({
          errorCode: "error_required_fields",
          errorParameter: "All fields are required",
        });
        feedbacks.setActivitySpinnerVisible(false, dataWrapper.uniqueId);
      }, 300);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      feedbacks.setActivitySpinnerVisible(
        true,
        dataWrapper.uniqueId,
        language.getString("sending_message")
      );
      setTimeout(() => {
        setValidationError({
          errorCode: "error_invalid_email",
          errorParameter: "Please enter a valid email address",
        });
        feedbacks.setActivitySpinnerVisible(false, dataWrapper.uniqueId);
      }, 300);
      return;
    }

    setValidationError(null);
    setStatus(ArticleContactFormStrapi.Status.SUBMITTING);
    feedbacks.setActivitySpinnerVisible(
      true,
      dataWrapper.uniqueId,
      language.getString("sending_message")
    );

    try {
      const apiResponse = await submitContactForm({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      feedbacks.setActivitySpinnerVisible(false, dataWrapper.uniqueId);
      _onApiResponse(apiResponse?.success);
    } catch (error) {
      feedbacks.setActivitySpinnerVisible(false, dataWrapper.uniqueId);
      _onApiResponse(false);
    }
  };

  const _onApiResponse = (success) => {
    if (!success) {
      setStatus(ArticleContactFormStrapi.Status.WAITING_FOR_SUBMISSION);
      feedbacks.displayNotification(
        language.getString("error"),
        language.getString(constants.ErrorCodes.MESSAGE_SUBMIT_FAILED),
        "error"
      );
    } else {
      setStatus(ArticleContactFormStrapi.Status.SUBMITTED);
    }
  };

  return (
    <RowForm id={id} onSubmit={_onSubmit}>
      {validationError && (
        <RowFormGroupAlert variant={"danger"} message={errorMessage} />
      )}

      {!didSubmit && (
        <ArticleContactFormStrapiContentFields
          onInput={setFieldsBundle}
          didSubmit={didSubmit}
        />
      )}

      {didSubmit && (
        <ArticleContactFormStrapiSuccessMessage
          dataWrapper={dataWrapper}
          email={emailDisplay}
          onReset={_onReset}
        />
      )}

      {!didSubmit && (
        <RowFormGroupSubmit
          faIcon={`fa-solid fa-envelope`}
          label={language.getString("send_message")}
        />
      )}
    </RowForm>
  );
}

/**
 * @param {Function} onInput
 * @param {Boolean} didSubmit
 * @return {JSX.Element}
 * @constructor
 */
function ArticleContactFormStrapiContentFields({ onInput, didSubmit }) {
  const language = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    onInput({
      name,
      email,
      subject,
      message,
    });
  }, [name, email, subject, message, onInput]);

  return (
    <>
      <RowFormGroupItem>
        <Input
          id="name"
          type="text"
          placeholder={language.getString("name")}
          value={name}
          onChange={setName}
          required={true}
          disabled={didSubmit}
        />
      </RowFormGroupItem>

      <RowFormGroupItem>
        <Input
          id="email"
          type="email"
          placeholder={language.getString("email")}
          value={email}
          onChange={setEmail}
          required={true}
          disabled={didSubmit}
        />
      </RowFormGroupItem>

      <RowFormGroupItem>
        <Input
          id="subject"
          type="text"
          placeholder={language.getString("subject")}
          value={subject}
          onChange={setSubject}
          required={true}
          disabled={didSubmit}
        />
      </RowFormGroupItem>

      <RowFormGroupItem>
        <Textarea
          id="message"
          placeholder={language.getString("message")}
          value={message}
          onChange={setMessage}
          required={true}
          disabled={didSubmit}
        />
      </RowFormGroupItem>
    </>
  );
}

/**
 * @param {ArticleDataWrapper} dataWrapper
 * @param {String} email
 * @param {Function} onReset
 * @return {JSX.Element}
 * @constructor
 */
function ArticleContactFormStrapiSuccessMessage({
  dataWrapper,
  email,
  onReset,
}) {
  const language = useLanguage();

  return (
    <MessageCard
      variant={MessageCard.Variants.SUCCESS}
      className={`article-contact-form-success-message`}
    >
      <MessageCardIcon faIcon={`fa-solid fa-check-circle`} />
      <MessageCardBody>
        <h5 className={`article-contact-form-success-message-title`}>
          {language.getString("message_sent_successfully")}
        </h5>
        <div className={`article-contact-form-success-message-text text-2`}>
          {language
            .getString("message_sent_successfully_description")
            .replace("{email}", email || "your email")}
        </div>
      </MessageCardBody>
      <MessageCardFooter>
        <StandardButton
          faIcon={`fa-solid fa-arrow-left`}
          label={language.getString("send_another_message")}
          onClick={onReset}
        />
      </MessageCardFooter>
    </MessageCard>
  );
}

export default ArticleContactFormStrapi;
