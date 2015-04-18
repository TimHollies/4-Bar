// Start with a webdriver instance:
var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until;

var chrome = require('selenium-webdriver/chrome');
var service = new chrome.ServiceBuilder('./jar-bin/chromedriver.exe').build();

var assert = require('chai').assert,
    test = require('selenium-webdriver/testing'),
    webdriver = require('selenium-webdriver');

test.describe('The website', function() {

	this.timeout(50000);

  test.it('should work', function() {
  	var driver = new chrome.createDriver(webdriver.Capabilities.chrome(), service);
 
  	driver.get('http://localhost:3000');

    var searchBox = driver.findElement(webdriver.By.css(".tune-card[title~='Atholl']"));
    searchBox.click();
    var tuneTitle = driver.findElement(webdriver.By.css(".card h1"));
    tuneTitle.getText().then(function(value) {
      assert.equal(value, 'Atholl Highlanders, The');
    });

    driver.quit();
  });
});