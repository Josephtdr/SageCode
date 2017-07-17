import { AngulartestPage } from './app.po';

describe('angulartest App', () => {
  let page: AngulartestPage;

  beforeEach(() => {
    page = new AngulartestPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
