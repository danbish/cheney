/*! Cheney for Quail quailjs.org/cheney | quailjs.org/license */
(function($) {
$.fn.cheney = function(options) {
  if (!this.length) {
    return this;
  }
  cheney.options = options;

  cheney.html = this;
  cheney.run();
  
  return this;
};

var cheney = {};

cheney.options = {};

cheney.highlightElement = function(event, clickEvent) {
  var that = cheney;
  if (!event.element.hasClass('accessibility-result')) {
    event.element.addClass('accessibility-result')
         .addClass(event.severity);
    var $image = $('<img>')
                 .attr('alt', Drupal.t('@severity error', { '@severity' : Drupal.t(event.severity) } ))
                 .attr('src', Drupal.settings.basePath + Drupal.settings.accessibility.icon_path + event.severity + '.png');
    var $link = $('<a>')
                .attr('href', '#accessibility-console')
                .attr('role', 'command')
                .addClass('accessibility-icon')
                .addClass(event.severity)
                .append($image);
    event.element.before($link);
    if(typeof clickEvent === 'undefined') {
      Drupal.accessibility.attachHint(event);
    }
    else {
      clickEvent(event);
    }
  }
  var test = that.settings.tests[event.testName].testId;
  if (typeof that.messages[test] == 'undefined') {
    $.getJSON(Drupal.settings.basePath + 'accessibility-test/' + test + '/json', function(data) {
      that.messages[test] = data;
    });
  }
  var elementTests = event.element.data('accessibility-tests') || { };
  elementTests[that.settings.tests[event.testName].testId] = that.settings.tests[event.testName].testId;
  event.element.add(event.element.prev($('accessibility-icon'))).data('accessibility-tests', elementTests);
    
};

cheney.attachHint = function(event, $context) {
  $context = $context || $('body');
  var that = this;
  event.element.add(event.element.prev($('.accessibility-icon')))
               .click(function(event) {
                 var tests = $(this).data('accessibility-tests');
                 that.errorConsole.showTests(tests);
                 $('html, body').animate({
                   scrollTop: $(this).offset().top
                 }, 10);
                 that.errorConsole.setCurrentElement($(this), $context);
                 event.preventDefault();
               });
};

cheney.cleanUpHighlight = function($context) {
  $context = $context || $('html');
  $context.find('.accessibility-result').each(function() {
    $(this).removeClass('accessibility-result')
           .removeClass('severe')
           .removeClass('moderate')
           .removeClass('suggestion');
  });
  $context.find('.accessibility-icon, .accessibility-icon-current').remove();
};
cheney.errorConsole = {

  $console : false,

  init : function() {
    if($('#accessibility-console').length) {
      return;
    }
    var that = this;
    $('body').append('<div id="accessibility-console" class="element-invisible">');
    this.$console = $('#accessibility-console');
    this.$console.append('<a name="accessibility-console">');
    this.$console.append('<div class="accessibility-console-content" role="marquee">');
    var $close = this.$console.append('<a role="button" class="close-console" href="#close" title="' +
                  Drupal.t('close accessibility console') +
                  '">&times;</a>');
    $close.click(function() {
      that.hide()
      return false;
    });
  },

  show : function() {
    this.init();
    this.$console.removeClass('element-invisible');
    $('body').trigger('accessibility-console-show');
  },

  hide : function() {
    this.init();
    this.$console.addClass('element-invisible');
    $('body').trigger('accessibility-console-hide');
  },

  addTest : function(test) {
    this.$console.append('<h3>' + Drupal.accessibility.messages[test].title + '</h3>');
  },

  showTests : function(tests) {
    var that = this;
    that.init();
    var $content = that.$console.find('.accessibility-console-content');
    $content.html('');
    $.each(tests, function(index, test) {
      $content.append('<h3>' + Drupal.accessibility.messages[test].title + '</h3>');
      $content.append(Drupal.accessibility.messages[test].content);
    });
    that.show();
  },

  setCurrentElement : function(element, $context) {
    $context = $context || $('body');
    $context.find('.accessibility-icon-current').remove();
    var $image = $('<img>')
         .attr('alt', Drupal.t('Current element'))
         .attr('role', 'note')
         .addClass('accessibility-icon-current')
         .attr('src', Drupal.settings.basePath + Drupal.settings.accessibility.icon_path + 'highlighted.png');
    element.prev('.accessibility-icon').before($image);
  }
};})(jQuery)