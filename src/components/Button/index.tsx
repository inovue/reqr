import {button} from './button.css.ts';
//import 'destyle.css'

export type ButtonProp = JSX.IntrinsicElements['button'] & {
  dark?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: boolean;
  children?: React.ReactNode;
}

const IconButton: React.FC<ButtonProp> = ({dark=true, size='md', rounded=true, children, ...props}) => {
  return (
    <button className={button({ dark, size, rounded })} {...props}>
      <div style={{lineHeight:0}}>{children}</div>
    </button>
  )
}

export default IconButton;