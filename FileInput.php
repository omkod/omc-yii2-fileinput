<?php


namespace app\widgets\fileInput;

use yii\base\InvalidConfigException;
use yii\web\View;
use yii\widgets\InputWidget;

/**
 * Class FileInput
 *
 * @package common\widgets\fileInput
 */
class FileInput extends InputWidget
{

    const DEFAULT_CONFIG = [
        'pluginOptions' => [
          'msgDropZone'           => 'Перетащите файлы сюда',
          'showMsgDropZone'       => TRUE,
          'required'              => FALSE,
          'msgFileRequired'       => 'Поле обязательно для заполнения.',
          'initialPreview'        => TRUE,
          'initialPreviewConfig'  => [
            'id'                    => 'id',
            'path'                  => 'file',
            'displayName'           => 'file',
            'useThumbs'             => FALSE,
            'thumbsPath'            => '/thumbs',
            'thumbWidth'            => 100,
            'thumbHeight'           => 100,
            'filePath'              => '',
            'filePathTrailingSlash' => true,
          ],
          'allowedFileExtensions' => [],

          'maxFileCount' => 1,
          'minFileCount' => FALSE,
          'maxFileSize'  => FALSE, //Kb
          'minFileSize'  => FALSE, //Kb

          'minImageHeight' => FALSE, //Px
          'maxImageHeight' => FALSE, //Px
          'minImageWidth'  => FALSE, //Px
          'maxImageWidth'  => FALSE, //Px

          'uploadContainerClasses' => [],
          'dropZoneClasses'        => [],
          'previewClasses'         => [],
          'bootstrapVersion'       => 4
        ],
      ];

    public $pluginOptions     = [];

    public $deletionInputName = NULL;


    /**
     * @throws InvalidConfigException
     */
    public function init()
    {
        parent::init();

        $this->pluginOptions = array_merge(self::DEFAULT_CONFIG['pluginOptions'], $this->options, $this->pluginOptions);

        if ($this->pluginOptions['multiple'] === FALSE) {
            $this->pluginOptions['maxFileCount'] = 1;
        }

        if ($this->pluginOptions['required'] === TRUE) {
            $this->pluginOptions['minFileCount'] = 1;
        }
    }

    /**
     * Executes the widget.
     *
     * @return string the rendering result may be directly "echoed" or returned as a string
     */
    public function run(): string
    {
        FileInputAsset::register($this->getView());

        $this->view->registerJs(
          sprintf(
            ';(function($){window.wfileinput_%s = new WFileInput("%s", %s)})(jQuery)',
            str_replace('-', '_', $this->options['id']),
            $this->options['id'],
            json_encode($this->pluginOptions)
          ),
          View::POS_LOAD
        );

        return $this->render('index', [
          'model'                  => $this->model,
          'attribute'              => $this->attribute,
          'options'                => $this->options,
          'deletionInputName'      => $this->deletionInputName ?: $this->attribute.'_to_delete[]',
          'msgDropFileHere'        => $this->pluginOptions['msgDropZone'],
          'showMsgDropZone'        => $this->pluginOptions['showMsgDropZone'],
          'initialPreview'         => $this->pluginOptions['initialPreview'],
          'id'                     => $this->pluginOptions['initialPreviewConfig']['id'],
          'path'                   => $this->pluginOptions['initialPreviewConfig']['path'],
          'displayName'            => $this->pluginOptions['initialPreviewConfig']['displayName'] ?? $this->pluginOptions['initialPreviewConfig']['path'],
          'msgFileRequired'        => $this->pluginOptions['msgFileRequired'],
          'uploadContainerClasses' => $this->pluginOptions['uploadContainerClasses'],
          'dropZoneClasses'        => $this->pluginOptions['dropZoneClasses'],
          'previewClasses'         => $this->pluginOptions['previewClasses'],
        ]);
    }

    public function isImage(string $extension): bool
    {
        return in_array($extension, [
          'jpg',
          'jpeg',
          'png',
          'gif',
          'tiff',
          'webp',
          'heif',
          'bmp',
        ]);
    }

    public function getThumbnail(string $path): string
    {
        $useThumbs = $this->pluginOptions['initialPreviewConfig']['useThumbs'];
        if ($useThumbs === TRUE) {
            $width      = $this->pluginOptions['initialPreviewConfig']['thumbWidth'];
            $height     = $this->pluginOptions['initialPreviewConfig']['thumbHeight'];
            $thumbsPath = $this->pluginOptions['initialPreviewConfig']['thumbsPath'];

            return "{$thumbsPath}/{$width}x$height/".$path;
        }

        return $this->getFullImage($path);
    }

    public function getFullImage(string $path): string
    {
        return $this->pluginOptions['initialPreviewConfig']['filePath']
          . ($this->pluginOptions['initialPreviewConfig']['filePathTrailingSlash'] ? '/' : '')
          . $path;
    }

    /**
     * в $model->{$attribute} не всегда будет корректный объект, там может быть строка (путь к файлу) или json
     *
     * @param $file
     * @return mixed|object|void
     */
    public function prepareFileData($file)
    {
        if (is_object($file) === TRUE) {
            return $file;
        }

        if ($this->isJSON($file) === TRUE) {
            return json_decode($file, FALSE);
        }

        if (is_string($file) === TRUE) {
            return (object)[
              'id' => 1,
              $this->pluginOptions['initialPreviewConfig']['path'] => $file
            ];
        }
    }

    private function isJSON(string $string): bool
    {
        json_decode($string);
        return json_last_error() === JSON_ERROR_NONE;
    }
}
