import './Button.css';

const Button = ({ children, variant = 'primary', onClick, href }) => {
  const className = `btn btn-${variant}`;
  
  if (href)
    return <a href={href} className={className}>{children}</a>;
  return <button className={className} onClick={onClick}>{children}</button>;
};
export default Button;