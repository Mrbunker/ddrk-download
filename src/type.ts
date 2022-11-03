interface trackItem {
  src: string;
  src0: string;
  src1: string;
  src2: string;
  src3: string;
  title: string;
  type: string;
  caption: string;
  description: string;
  image: { src: string; width: number; height: number };
  thumb: { src: string; width: number; height: number };
  meta: { length_formatted: string };
  portn: string;
  srctype: string;
  cut: string;
  vttshift: string;
  userIP: string;
  subsrc: string;
  dimensions: {
    original: { width: string; height: string };
    resized: { width: string; height: string };
  };
}
