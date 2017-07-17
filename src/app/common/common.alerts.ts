export default class Alert {
  id: string;

  constructor(public title: string, public message: string, public type: string = 'success') { }

  public show() {
    var saveAlertElement = document.getElementById(`alert${this.id}`);
    if (saveAlertElement) saveAlertElement.style.display = 'block';
  }

  public hide() {
    var saveAlertElement = document.getElementById(`alert${this.id}`);
    if (saveAlertElement) saveAlertElement.style.display = 'none';
  }
}
