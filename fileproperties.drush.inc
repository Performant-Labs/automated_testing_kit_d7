<?php

/**
 * Implements hook_drush_command().
 */
function fileproperties_drush_command() {
  $items['fprop'] = array(
    'description' => 'Obtain file properties',
    'callback' => 'drush_fileproperties',
    'drupal dependencies' => array('xmlsitemap'),
  );
  return $items;
}

/**
 * Implement fprop drush command
 *
 * @return string
 *   An array with the properaties of the file.
 */
function drush_fileproperties($filepath, $options = ['format' => 'json']) {
  if (file_exists($filepath)) {
    if (is_dir($filepath)) {
      $basename = '<directory>';
    }
    else {
      $basename = basename($filepath);
    }

    $rows[] = [
      'directory' => dirname($filepath),
      'filename' => $basename,
      'filesize' => filesize($filepath),
      'filectime' => filectime($filepath),
      'filemtime' => filemtime($filepath),
      'fileatime' => fileatime($filepath),
    ];

    return $rows;
  }
  else {
    $message = t("Does not exist: @filepath", array('@filepath' => $filepath));
    drupal_set_message($message);
  }
}