export const addCodeTag = (text: string) => {
  return text.replace(/{{\s*[\w.]+\s*}}/g, (t1) => {
    return `<code>${t1}</code>`
  });
}