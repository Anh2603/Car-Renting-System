import React, { useState } from 'react';
import { createContactMessage } from '../../services/contactService';
import { useLanguage } from '../../i18n/LanguageContext';
import './ContactPage.css';

const CONTACT_REASON_VALUES = [
  { value: 'Booking issue', labelKey: 'contact.reasons.booking' },
  { value: 'Payment issue', labelKey: 'contact.reasons.payment' },
  { value: 'Pickup / return support', labelKey: 'contact.reasons.pickup' },
  { value: 'Car availability', labelKey: 'contact.reasons.availability' },
  { value: 'Account support', labelKey: 'contact.reasons.account' },
  { value: 'General question', labelKey: 'contact.reasons.general' },
];

const INITIAL_FORM = {
  fullName: '',
  email: '',
  contactReason: '',
  topic: '',
  details: '',
};

function ContactPage({ user }) {
  const { language, t } = useLanguage();
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    fullName: user?.full_name || '',
    email: user?.email || '',
  }));
  const [attachment, setAttachment] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0] || null;
    setAttachment(file);
  };

  const validateForm = () => {
    if (!form.fullName.trim()) {
      alert(t('contact.errors.fullName'));
      return false;
    }

    if (!form.email.trim()) {
      alert(t('contact.errors.email'));
      return false;
    }

    if (!form.contactReason) {
      alert(t('contact.errors.contactReason'));
      return false;
    }

    if (!form.topic.trim()) {
      alert(t('contact.errors.topic'));
      return false;
    }

    if (!form.details.trim()) {
      alert(t('contact.errors.details'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('fullName', form.fullName.trim());
      formData.append('email', form.email.trim());
      formData.append('contactReason', form.contactReason);
      formData.append('topic', form.topic.trim());
      formData.append('details', form.details.trim());

      if (attachment) {
        formData.append('attachment', attachment);
      }

      await createContactMessage(formData);

      setSubmitted(true);
      setForm({
        ...INITIAL_FORM,
        fullName: user?.full_name || '',
        email: user?.email || '',
      });
      setAttachment(null);
    } catch (error) {
      console.error('Submit contact message error:', error);
      alert(error.message || t('contact.errors.submit'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="contact-simple-page">
      <section className="contact-simple-wrap">
        <h1>{t('contact.title')}</h1>

        <p>{t('contact.intro1')}</p>

        <p>{t('contact.intro2')}</p>

        <p className="contact-required-note">{t('contact.requiredNote')}</p>

        {submitted && (
          <div className="contact-simple-alert">
            {t('contact.submitted')}
          </div>
        )}

        <form className="contact-simple-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder={t('contact.fullName')}
            autoComplete="name"
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t('contact.email')}
            autoComplete="email"
          />

          <select
            name="contactReason"
            value={form.contactReason}
            onChange={handleChange}
            aria-label={t('contact.ariaContactReason')}
          >
            <option value="">{t('contact.contactReason')}</option>
            {CONTACT_REASON_VALUES.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {t(reason.labelKey)}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="topic"
            value={form.topic}
            onChange={handleChange}
            placeholder={t('contact.topic')}
          />

          <textarea
            name="details"
            value={form.details}
            onChange={handleChange}
            placeholder={t('contact.details')}
            rows="9"
          />

          <label className="contact-attachment-line">
            <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={handleAttachmentChange} />
            <span aria-hidden="true">⌕</span>
            {attachment ? attachment.name : t(language === 'vi' ? 'contact.attachVi' : 'contact.attach')}
          </label>

          <button type="submit" disabled={loading}>
            {loading ? t('contact.submitting') : t('contact.submit')}
          </button>
        </form>
      </section>
    </main>
  );
}

export default ContactPage;
