<?php

declare(strict_types=1);

namespace Drupal\automated_testing_kit\Drush\Commands;

use Consolidation\OutputFormatters\StructuredData\RowsOfFields;
use Drush\Attributes as CLI;
use Drush\Commands\DrushCommands;

/**
 *
 */
final class AutomatedTestingKitDrushCommands extends DrushCommands {

  /**
   * Constructs an AutomatedTestingKitCommands object.
   */
  public function __construct() {
    parent::__construct();
  }

  /**
   * Command description here.
   */
  #[CLI\Command(name: 'file:properties', aliases: ['fprop'])]
    #[CLI\Argument(name: 'filepath', description: 'Path to the file.')]
    #[CLI\Usage(name: 'file:properties filepath]', description: 'Usage description.')]
    #[CLI\FieldLabels(labels: [
      'directory' => 'Directory',
      'filename' => 'Filename',
      'filesize' => 'File Size',
      'filectime' => 'File Created',
      'filemtime' => 'File Modified',
      'fileatime' => 'File Accessed',

    ])]
    public function fileProperties($filepath, $options = ['format' => 'json']): RowsOfFields {
    // Get the file system service.
    $fileSystem = \Drupal::service('file_system');

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
        'fileatime' => filemtime($filepath),
      ];

      return new RowsOfFields($rows);
    }
    else {
      $this->logger()->error(dt("Does not exist: $filepath."));
    }
    }

}