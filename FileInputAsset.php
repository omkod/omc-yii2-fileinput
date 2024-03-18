<?php


namespace app\widgets\fileInput;

use yii\web\AssetBundle;

class FileInputAsset extends AssetBundle
{

    public $css = [
        'css/lightbox.min.css',
        'css/style.min.css',
      ];

    public $js = [
        'js/lightbox.min.js',
        'js/script.min.js',
      ];

    public function init()
    {
        $this->sourcePath = __DIR__."/assets";
        parent::init();
    }
}