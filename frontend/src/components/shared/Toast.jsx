import { Toaster } from 'react-hot-toast';

/**
 * Shared toast renderer for apps that prefer a component import.
 *
 * @returns {JSX.Element}
 */
const Toast = () => <Toaster position="top-right" toastOptions={{ duration: 3200 }} />;

export default Toast;
