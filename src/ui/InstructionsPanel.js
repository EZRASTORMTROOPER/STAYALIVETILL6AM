export class InstructionsPanel {
  constructor(panelElement) {
    this.panelElement = panelElement;
    this.dismissed = false;

    this.onClick = () => {
      this.dismiss();
    };

    this.panelElement.addEventListener('click', this.onClick);
  }

  dismiss() {
    if (this.dismissed) return;
    this.dismissed = true;
    this.panelElement.classList.add('hidden');
  }

  reset() {
    this.dismissed = false;
    this.panelElement.classList.remove('hidden');
  }
}
