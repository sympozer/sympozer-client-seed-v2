import { SympozerPage } from './app.po';

describe('sympozer App', function() {
  let page: SympozerPage;

  beforeEach(() => {
    page = new SympozerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
