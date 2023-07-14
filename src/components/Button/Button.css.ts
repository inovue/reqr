import { recipe } from '@vanilla-extract/recipes';

export const button = recipe({
  base: {
    borderRadius: 6,
    cursor: 'pointer',
    borderTop:'1px solid',
    borderRight: '0px solid',
    borderBottom: '0px solid',
    borderLeft: '1px solid',
  },

  variants: {
    dark: {
      true: {
        borderColor: '#777',
        background: 'linear-gradient(125deg, #666, #111)',
        color: '#ccc'
      },
      false:{
        borderColor: '#888',
        background: 'linear-gradient(125deg, #999, #eee)',
        color: '#444'
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