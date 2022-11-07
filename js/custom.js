/**
 * @file
 * A JavaScript file for the theme.
 *
 * In order for this JavaScript to be loaded on pages, see the instructions in
 * the README.txt next to this file.
 */

// JavaScript should be made compatible with libraries other than jQuery by
// wrapping it with an "anonymous closure". See:
// - https://drupal.org/node/1446420
// - http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function ($, Drupal, debounce) {

  'use strict';

  // To understand behaviors, see https://drupal.org/node/756722#behaviors
  Drupal.behaviors.subtheme_behavior = {
    attach: function (context, settings) {

      //////////////////////////////////////////////////////
      // Initialize megamenu library on main menu.
      $('nav#block-moody-accessible-main-menu').accessibleMegaMenu({
          uuidPrefix: "accessible-megamenu",
          menuClass: "nav-menu",
          topNavItemClass: "main-menu__list-item",
          panelClass: "sub-nav",
          panelGroupClass: "sub-nav-wrapper",
          hoverClass: "hover",
          focusClass: "focus",
          openClass: "open",
          openDelay: 0,
          closeDelay: 250,
          openOnMouseover: true
      });

      //////////////////////////////////////////////////////
      // Enable main menu dropdown trigger and set aria-expanded attribute.
      var menuToggler = $('#menu-icon');
      var togglerTarget = $('.nav-wrapper');
      var toggleIcon = $('#menu-icon > svg');
      var hamburgerIcon = '<title>Open Menu</title><path d="M24 21v2c0 0.547-0.453 1-1 1h-22c-0.547 0-1-0.453-1-1v-2c0-0.547 0.453-1 1-1h22c0.547 0 1 0.453 1 1zM24 13v2c0 0.547-0.453 1-1 1h-22c-0.547 0-1-0.453-1-1v-2c0-0.547 0.453-1 1-1h22c0.547 0 1 0.453 1 1zM24 5v2c0 0.547-0.453 1-1 1h-22c-0.547 0-1-0.453-1-1v-2c0-0.547 0.453-1 1-1h22c0.547 0 1 0.453 1 1z"></path>';
      var closeIcon = '<title>Close Menu</title><path d="M20.281 20.656c0 0.391-0.156 0.781-0.438 1.062l-2.125 2.125c-0.281 0.281-0.672 0.438-1.062 0.438s-0.781-0.156-1.062-0.438l-4.594-4.594-4.594 4.594c-0.281 0.281-0.672 0.438-1.062 0.438s-0.781-0.156-1.062-0.438l-2.125-2.125c-0.281-0.281-0.438-0.672-0.438-1.062s0.156-0.781 0.438-1.062l4.594-4.594-4.594-4.594c-0.281-0.281-0.438-0.672-0.438-1.062s0.156-0.781 0.438-1.062l2.125-2.125c0.281-0.281 0.672-0.438 1.062-0.438s0.781 0.156 1.062 0.438l4.594 4.594 4.594-4.594c0.281-0.281 0.672-0.438 1.062-0.438s0.781 0.156 1.062 0.438l2.125 2.125c0.281 0.281 0.438 0.672 0.438 1.062s-0.156 0.781-0.438 1.062l-4.594 4.594 4.594 4.594c0.281 0.281 0.438 0.672 0.438 1.062z" ></path>';
      menuToggler.on('click', function () {
        if (menuToggler.text() == 'CLOSE') {
          resetDefaults();
        }
        togglerTarget.toggleClass('active');
        togglerTarget.hasClass('active') ? menuToggler.find('span').html('CLOSE') : menuToggler.find('span').html('MENU');
        togglerTarget.hasClass('active') ? toggleIcon.html(closeIcon) : toggleIcon.html(hamburgerIcon);
        togglerTarget.hasClass('active') ? toggleIcon.attr('viewBox', '0 5 23 23') : toggleIcon.attr('viewBox', '-1 3 27 25');
        menuToggler.attr('aria-expanded', function (index, attr) { return (attr == 'false') ? 'true' : 'false'; });
        $('body').toggleClass('overflow-hidden');
      });

      //////////////////////////////////////////////////////
      $('#moody-header .mobile-nav .nav-link').each(function () {
        var URL = $(this).attr('href') || false;
        if (URL && !$(this).hasClass('caret')) {
          $(this).on('click', function () {
            window.location.href = URL;
          })
        }
      });

      //////////////////////////////////////////////////////
      // Turn off hover events on main nav on subsite pages.
      $('.moody-subsite-page .main-menu__list').off('mouseover touchstart');
      $('.moody-subsite-page .moody-subnav-trigger').on('click', function() {
        // $(this).toggleClass('icon--open');
      });

      //////////////////////////////////////////////////////
      // Reset aria attributes and remove dynamic classes from main menu list items.
      var resetDefaults = function () {
        $('.main-menu__link').removeClass('add-border');
        $('ul.main-menu__list.nav-menu .sub-nav-wrapper').removeClass('open hover focus').attr('aria-expanded', 'false').attr('aria-hidden', 'true');
        $('ul.main-menu__list.nav-menu .main-menu__link').removeClass('open').attr('aria-expanded', 'false');
        $('ul.main-menu__list.nav-menu .main-menu__list--subnav').removeClass('open');
        $('.moody-subnav-trigger').removeClass('icon--open');
      }

      //////////////////////////////////////////////////////
      // Click event on L2 links on mobile menu trigger.
      var iconClick = function () {
        $('.moody-subnav-trigger').on('touchstart mousedown keydown', function (e) {
          if (e.type == 'mousedown' || e.type == 'touchstart' || e.keyCode == 13) {
            // Keep mousedown event from grabbing focus.
            e.preventDefault();
            e.stopPropagation();
            $(this).toggleClass('icon--open');
            // Add border on sibling link when active.
            $(this).siblings('.main-menu__link').toggleClass('add-border');
            // Add 'open' class to subnav associated with icon.
            $(this).siblings('.sub-nav-wrapper').find('.main-menu__list--subnav').toggleClass('open');
            // Remove 'open' class from all other subnavs.
            $(this).parent('.main-menu__list-item').siblings().find('.main-menu__list--subnav').removeClass('open');
            // Remove 'icon--open' class from all other icons.
            $(this).parent('.main-menu__list-item').siblings().find('.moody-subnav-trigger').removeClass('icon--open');
            // Toggle aria attributes.
            $(this).siblings('.main-menu__link').attr('aria-expanded', function (index, attr) { return (attr == 'true') ? 'false' : 'true'; });
            $(this).siblings('.sub-nav-wrapper').attr('aria-hidden', function (index, attr) { return (attr == 'true') ? 'false' : 'true'; });
            $(this).siblings('.sub-nav-wrapper').attr('aria-expanded', function (index, attr) { return (attr == 'true') ? 'false' : 'true'; });
            // Reset aria attributes and styles of the clicked item's siblings.
            $(this).parent('.main-menu__list-item').siblings().find('.main-menu__link').removeClass('add-border');
            $(this).parent('.main-menu__list-item').siblings().find('.sub-nav-wrapper').attr('aria-expanded', 'false').attr('aria-hidden', 'true');
            $(this).parent('.main-menu__list-item').siblings().find('.main-menu__link').attr('aria-expanded', 'false');
          }
        });
      }

      //////////////////////////////////////////////////////
      // Get innerWidth to use for later comparison
      var currentWidth = window.innerWidth;
      // Function to add click handler on load and resize
      var resizeEvent = debounce(function () {
        // Close mobile nav if screen resized.
        menuToggler.attr('aria-expanded', 'false');
        togglerTarget.removeClass('active');
        resetDefaults();
        // Attach click event to chevron on subsite desktop.
        if ($('body').hasClass('moody-subsite-page') || (window.innerWidth < 1200)) {
            // Add click handler to mobile nav chevron.
            iconClick();
            // Remove mouseover and touchstart event from main menu.
            $('.main-menu__list').off('mouseover touchstart');
        }
      }, 100);
      $(window).on('load', resizeEvent);
      $(window).on('resize', function(e) {
        var newWidth = window.innerWidth;
        if (newWidth !== currentWidth) {
          currentWidth = newWidth;
          resizeEvent;
        }
      });

      //////////////////////////////////////////////////////
      // Adding column and overflowing classes to the navigation dynamically.
      $('nav#block-moody-accessible-main-menu .sub-nav').each(function(i, el){
        var $el = $(el),
          navWidth = $el.parent().parent().width(),
          navOffsetLeft = $el.parent().parent().offset().left,
          subnavOffsetLeft = $el.offset().left,
          subnavWidth;

        // Determine subnavWidth here because it needs to be calculated after the column
        // classes have been added.
        subnavWidth = $el.children().outerWidth();
        // Insure subnavs don't open to the right of the container.
        if ((subnavWidth + subnavOffsetLeft) > (navWidth + navOffsetLeft)) {
          $el.addClass('overflowing');
        }
      });

      //////////////////////////////////////////////////////
      // East Austin Story modals (these use youtube embeds)
      // Prague Stories modals (these use vimeo embeds)
      // RTF Showcase modals (these use vimeo embeds)
      $("#easModal, #psModal, #rtfscModal").on("show.bs.modal", function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var url = button.data("video");      // Extract url from data-video attribute
        var title = button.data("modal-title"); // Extract title from data-modal-title attribute
        var description = button.data("modal-description"); // Extract description from data-modal-description attribute
        $(this).find("div.modal-body").append("<iframe></iframe>");
        $(this).find("iframe").attr({
          src: url,
          title: title,
          allow: "accelerometer; encrypted-media; gyroscope; picture-in-picture"
        });
        $(this).find("h4.modal-title").append(title);
        $(this).find("p.modal-description").append(description);
      }).on("hidden.bs.modal", function () { // Remove some data when modal is closed
        $(this).find("iframe").remove();
        $(this).find("h4.modal-title").empty();
        $(this).find("p.modal-description").empty();
      });

      //////////////////////////////////////////////////////
      // Add active class to subsite nav items
      var currentPath = window.location.pathname;
      $('.subsite-navigation .subsite-nav-item').each(function () {
        var thisPath = $(this).find('.main-menu__link').attr('href');
        if (thisPath === currentPath) {
          $(this).find('.main-menu__link').addClass('is-active');
        }
      });

      //////////////////////////////////////////////////////
      // Add plyr to media pages with audio tags for mp3 playback.
      if ($('.field--name-field-media-audio-file audio').length) {
        const player = new Plyr('#moody-media-audio');
      }

      //////////////////////////////////////////////////////
      // Run the Main Moody events through slick.js
      var eventList = $('.moody-events-view .event-list');
      if (eventList.length != 0) {
        eventList.slick({
          autoplay: true,
          autoplaySpeed: 5000,
          arrows: false,
          dots: true
        });
        // Move play/pause button down to dots list.
        $('.slick-autoplay-toggle-button').appendTo($('.slick-dots')).wrap('<li></li>');
        // Update text on dots.
        $('.slick-dots .slick-sr-only').each(function(){
          var slideNum = $(this).text().substring(12);
          $(this).replaceWith(slideNum);
        });
        // Hide controls if less than two items.
        if (!$('.slick-dots').length) {
          $('.slick-autoplay-toggle-button').hide();
        }
      }

      //////////////////////////////////////////////////////
      // Remove extra whitespace from hidden subsite page titles parent blocks.
      $('h1.sr-only').parent('#block-pagetitle').css('margin-bottom', 0);

    }
  };

  // We pass the parameters of this anonymous function are the global variables
  // that this script depend on. For example, if the above script requires
  // jQuery, you should change (Drupal) to (Drupal, jQuery) in the line below
  // and, in this file's first line of JS, change function (Drupal) to
  // (Drupal, $)
})(jQuery, Drupal, Drupal.debounce);
