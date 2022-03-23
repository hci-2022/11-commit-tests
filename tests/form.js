describe('The Post Form', function() {

  it('the form should exist', function(browser) {
    browser
      .url('http://localhost:8080/')
      .assert
        .elementPresent('form[name="post"]');
  });

  it('short input should display the correct error', function(browser) {
    browser
      .url('http://localhost:8080/')
      .sendKeys('input#title', 'Oh')
      .sendKeys('textarea#content', 'My')
      .waitForElementPresent('.content-error')
      .assert.visible('.content-error')
      .assert.visible('.title-error')
      .assert.textContains('.content-error', 'Content must be at least 3 characters')
      .assert.textContains('.title-error', 'Title must be at least 3 characters');
  });

  /* TODO: Add helper to clear local storage before running tests */

});
