import {button} from './Button.css.js';

export type ButtonProps = JSX.IntrinsicElements['button'] & {
  dark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({dark=true, size='md', rounded=true, children, ...props}) => {
  return (
    <button className={button({ dark, size, rounded })} {...props}>
      <div style={{lineHeight:0}}>{children}</div>
    </button>
  )
}

export default Button;