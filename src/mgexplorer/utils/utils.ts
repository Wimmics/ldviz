export function format(first: string, middle: string, last: string): string {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}

export function screenshotOptions(width, height) {
  let scale = 2
  return  { 
    quality: 1.0,
    backgroundColor: '#FFFFFF',
    width: width * scale, 
    height: height * scale,
    style: {
      transform: `scale(${scale})`,
      transformOrigin: 'top left'
    }
  }
}

export function takeScreenshot(url: string, format:string, vis: string) {
   // It will return a canvas element
   var linkScreenShot = document.createElement('a');
   linkScreenShot.href = url;
   linkScreenShot.download = `screenshot_${vis}_${Date.now()}.${format}`
   // Firefox requires the link to be in the body
   document.body.appendChild(linkScreenShot);

   // simulate click
   linkScreenShot.click();

   // remove the link when done
   document.body.removeChild(linkScreenShot);
}