import { recipe } from '@vanilla-extract/recipes';

export const button = recipe({
  base: {
    borderRadius: 6,
    cursor: 'pointer',
    height: '100%',
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
      sm: { fontSize:'.8rem', padding: 6 },
      md: { fontSize:'1.5rem', padding: 8 },
      lg: { fontSize:'2.2rem', padding: 12 },
      xl: { fontSize:'2.5rem', padding: 12 }
    },
    rounded: {
      true: { borderRadius: 999 }
    }
  },


  defaultVariants: {
    dark: false,
    size: 'md',
  }
});