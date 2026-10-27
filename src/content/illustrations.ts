/** Art direction only. These are labelled placeholders, not final commissioned artwork. */
export interface IllustrationSpec {
  id: string;
  title: string;
  status: 'placeholder';
  assetPath: null;
  label: string;
  alt: string;
  brief: string;
  palette: string[];
}

const palette = ['#F7F1E8', '#C96F43', '#262722', '#9BADA0', '#D8BE8D'];

export const ILLUSTRATIONS: Record<string, IllustrationSpec> = {
  office: {
    id: 'office', title: 'The first move', status: 'placeholder', assetPath: null,
    label: 'Scene illustration · planned',
    alt: 'Placeholder for an illustrated office desk with a laptop, notebook, and coffee.',
    brief: 'Editorial ink-and-wash illustration of a fluorescent-lit office cubicle, open laptop, cold coffee, and a notebook. Warm paper texture, restrained burnt orange and sage, contemporary business setting. No text embedded in the artwork.',
    palette,
  },
  home: {
    id: 'home', title: 'After hours', status: 'placeholder', assetPath: null,
    label: 'Scene illustration · planned',
    alt: 'Placeholder for an illustrated home workspace after hours.',
    brief: 'A small, believable home workspace with a second-hand laptop, scattered working notes, and a desk lamp after dark. Quiet entrepreneurial energy; no luxury lifestyle imagery and no fantasy imagery.',
    palette,
  },
  strategy: {
    id: 'strategy', title: 'A plan takes shape', status: 'placeholder', assetPath: null,
    label: 'Scene illustration · planned',
    alt: 'Placeholder for an illustrated notebook, research notes, and laptop.',
    brief: 'Overhead editorial illustration of a notebook, research notes, an open laptop, pencil, and coffee ring. Convey experimentation and learning without adding story events, company logos, or readable invented manuscript text.',
    palette,
  },
  mentor: {
    id: 'mentor', title: 'A little guidance', status: 'placeholder', assetPath: null,
    label: 'Scene illustration · planned',
    alt: 'Placeholder for an illustrated conversation across a café table.',
    brief: 'A casual café table with two coffees, an open notebook, and two people discussing a business idea. Avoid assigning undocumented age, ethnicity, or gender as canonical mentor identities. Match the ink-and-wash visual system.',
    palette,
  },
  capital: {
    id: 'capital', title: 'Money on the line', status: 'placeholder', assetPath: null,
    label: 'Scene illustration · planned',
    alt: 'Placeholder for illustrated paperwork, a calculator, and a notebook.',
    brief: 'A modest desk with funding paperwork, a calculator, notebook, and laptop. Contemporary, human, and slightly imperfect. Use abstract paper markings rather than inventing contract terms or financial rules.',
    palette,
  },
  momentum: {
    id: 'momentum', title: 'Building momentum', status: 'placeholder', assetPath: null,
    label: 'Scene illustration · planned',
    alt: 'Placeholder for a workspace with customer messages and working notes.',
    brief: 'A founder’s desk with an open laptop and a few customer-message shapes. Show modest progress and momentum without introducing new events, numerical results, or invented brand logos.',
    palette,
  },
};

export const illustrations = ILLUSTRATIONS;
