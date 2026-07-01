export function useGetAngularScope() {
  const iframe = (document.querySelector('iframe') as any)?.contentWindow;
  const angularElement = iframe?.angular?.element;
  const angularScope =
    angularElement &&
    angularElement(
      iframe?.document?.querySelector('#edit-river-angular'),
    ).scope();
  return { angularScope };
}
