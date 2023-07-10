import { recipe } from '@vanilla-extract/recipes';

export const button = recipe({
  base: {
    borderRadius: 6,
    cursor: 'pointer',
  },

  variants: {
    dark: {
      true: { 
        background: '#222',
        color: '#eee'
      },
      false:{
        background: '#eee',
        color: '#222'
      }
    },
    size: {
      sm: { fontSize:'.8rem', height:'1.3rem', padding: '.25rem' },
      md: { fontSize:'1.5rem', height:'3.0rem', padding: '.5rem' },
      lg: { fontSize:'2.2rem', height:'3.9rem', padding: '.75rem' }
    },
    rounded: {
      true: { borderRadius: 999, aspectRatio:"1" }
    }
  },


  defaultVariants: {
    dark: false,
    size: 'md',
  }
});