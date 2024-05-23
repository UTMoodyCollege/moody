<?php

/**
 * @file
 * Theme settings which allow for configuration settings through the theme UI.
 */

use Drupal\Core\Form\FormStateInterface;

/**
 * Implements hook_form_system_theme_settings_alter().
 */
function moody_form_system_theme_settings_alter(&$form, FormStateInterface $form_state, $form_id = NULL) {

  // Forty Acres custom settings.
  $form['utexas_custom_section'] = [
    '#type' => 'markup',
    '#markup' => '<h2><small>Forty Acres Custom Settings</small></h2>',
  ];
  $form['ut_vertical_tabs'] = [
    '#type' => 'vertical_tabs',
  ];
  // Header settings.
  $form['header_theme_settings'] = [
    '#type' => 'details',
    '#title' => t('Header settings'),
    '#collapsible' => TRUE,
    '#group' => 'ut_vertical_tabs',
  ];
  $setting = theme_get_setting('logo_height');
  $form['logo']['logo_height'] = [
    '#type' => 'radios',
    '#title' => t('Logo Height'),
    '#description' => "Most UT Austin logos will work with the 'short' option, but logos that are taller or wider than normal may need to use the 'tall' setting in order to not appear too small. For best results, use an image that is twice as large as the desired display size, for higher pixel density screens.",
    '#options' => [
      'short_logo' => t('Short (height of 60px on desktop)'),
      'medium_logo' => t('Medium (height of 80px on desktop)'),
      'tall_logo' => t('Tall (height of 100px on desktop)'),
    ],
    '#default_value' => isset($setting) ? $setting : 'medium_logo',
  ];
  // Header settings subsections.
  $form['header_theme_settings']['give_link'] = [
    '#type' => 'textfield',
    '#title' => t('Give Link'),
    '#description' => t('Enter a link for the Give button'),
    '#attributes' => [
      'placeholder' => 'https://',
    ],
    '#default_value' => theme_get_setting('give_link'),
  ];
  $form['header_theme_settings']['parent_entity_fieldset'] = [
    '#type' => 'fieldset',
    '#title' => t('Parent entity settings'),
  ];
  $form['header_theme_settings']['parent_entity_fieldset']['parent_link_title'] = [
    '#type' => 'textfield',
    '#title' => t('Parent Entity Name'),
    '#description' => t("OPTIONAL - Enter the name of the site's parent college or office, if providing a link to the parent unit in the orange University Brand Bar. This will appear as a link at the left of the Brand Bar."),
    '#default_value' => theme_get_setting('parent_link_title'),
    '#maxlength' => 256,
  ];
  $form['header_theme_settings']['parent_entity_fieldset']['parent_link'] = [
    '#type' => 'url',
    '#title' => t('Parent Entity Website'),
    '#description' => t("If providing a parent entity link in the brand bar above, enter the URL of the site's parent college or office. This is required if you have entered a Parent Entity Name."),
    '#default_value' => theme_get_setting('parent_link'),
    '#maxlength' => 256,
    '#attributes'    => [
      'placeholder' => t('https://'),
    ],
    '#element_validate' => ['_moody_parent_link_validate'],
  ];

  // Option to select the setting for "Brandbar Logo" - This can be set to either "Moody Texas" or "Texas" for the classic UT Logo.
  $form['header_theme_settings']['brandbar_logo'] = [
    '#type' => 'radios',
    '#title' => t('Brandbar Logo'),
    '#description' => t('Select the logo to display in the orange University Brand Bar.'),
    '#options' => [
      'moody' => t('Moody Texas'),
      'utexas' => t('Texas'),
    ],
    '#default_value' => theme_get_setting('brandbar_logo'),
  ];

  // Option to select the "Brandbar Color" - This can be "Burnt Orange" or "bg-ut-bluebonnet--s20" for the bluebonnet color.
  $form['header_theme_settings']['brandbar_color'] = [
    '#type' => 'radios',
    '#title' => t('Brandbar Color'),
    '#description' => t('Select the color for the orange University Brand Bar.'),
    '#options' => [
      'bg-ut-burntorange' => t('Burnt Orange'),
      'bg-ut-bluebonnet--s20' => t('Bluebonnet'),
    ],
    '#default_value' => theme_get_setting('brandbar_color'),
  ];

  $form['#submit'][] = 'moody_form_system_theme_settings_submit';
}

/**
 * Helper function to provide validation on Parent Entity Website.
 */
function _moody_parent_link_validate($element, FormStateInterface &$form_state) {
  $parent_title = $form_state->getValue('parent_link_title');
  $parent_link = $form_state->getValue('parent_link');
  if (!empty($parent_title) && empty($parent_link)) {
    $form_state->setError($element, t('Please enter a link for the Parent Entity Website.  A link is required if you have entered a Parent Entity Name.'));
  }
}

/**
 * Theme Settings Submit Callback.
 */
function moody_form_system_theme_settings_submit($form, FormStateInterface &$form_state) {
  drupal_flush_all_caches();
}
