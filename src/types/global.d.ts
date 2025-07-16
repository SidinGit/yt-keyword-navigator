export {}; 

declare global {
  interface Window {
    /** YouTube IFrame API namespace injected by YouTube */
    YT?: {
      get: (id: string) => any;
      // you can add more methods if needed
    };
  }
}
