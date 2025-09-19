export interface ContactForm {
    name: string;
    email: string;
    message: string;
  }
  
  export interface ContactFormProps {
    onSubmit: (data: ContactForm) => void;
  }