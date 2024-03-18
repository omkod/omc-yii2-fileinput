<?php


use yii\db\ActiveRecord;
use yii\helpers\Html;

/** @var array $options */
/** @var ActiveRecord $model */
/** @var string $deletionInputName */
/** @var string $msgDropFileHere */
/** @var bool $showMsgDropZone */
/** @var bool $initialPreview */
/** @var string $id */
/** @var string $path */
/** @var array $uploadContainerClasses */
/** @var array $dropZoneClasses */
/** @var array $previewClasses */

$isMultiple = $options['multiple'];

?>

<div class="wf-upload-container <?php if ($isMultiple === FALSE ):?>wf-upload-container-single <?php endif;?> <?= implode(' ', $uploadContainerClasses)?>">
  <div class="wf-drop-zone <?= implode(' ', $dropZoneClasses) ?>">
      <?php if ($model->{$attribute} !== NULL): ?>
          <?php if ($initialPreview === TRUE): ?>
              <?php foreach ($isMultiple ? $model->{$attribute} : [$model->{$attribute}] as $key => $file): ?>
              <?php $file = $this->context->prepareFileData($file);?>
              <?php if (!$file->{$path}): continue; endif;?>
                  <?php $isImages = $this->context->isImage(pathinfo($file->{$path}, PATHINFO_EXTENSION)); ?>
                  <?php if ($isImages === TRUE): ?>
                    <div class="wf-preview is-exists <?= implode(' ', $previewClasses) ?>">
                      <i class="wf-remove-preview fa fa-times cursor-pointer" data-id="<?= $key ?>"
                         data-file-id="<?= $file->{$id} ?>"></i>
                      <a href="<?= $this->context->getFullImage($file->{$path}) ?>" data-lightbox="<?= $key ?>">
                        <img src="<?= $this->context->getThumbnail($file->{$path}) ?>" class="wf-preview-image" alt="">
                      </a>
                    </div>
                  <?php else: ?>
                    <div id="wf-preview-template-file" class="wf-preview is-exists <?= implode(' ', $previewClasses) ?>">
                      <i class="wf-remove-preview fa fa-times cursor-pointer" data-id="<?= $key ?>"
                         data-file-id="<?= $file->{$id} ?>"></i>
                      <i class="fa fa-file-o" aria-hidden="true"></i>
                      <span class="wf-preview-file-name text-center"><?= $file->{$displayName} ?></span>
                    </div>
                  <?php endif; ?>
              <?php endforeach; ?>
          <?php endif; ?>
      <?php endif; ?>
  </div>
  <?php if ($showMsgDropZone === TRUE): ?>
    <div class="wf-description">
      <p class="text-center text-muted"><?= $msgDropFileHere ?></p>
    </div>
  <?php endif; ?>
  <div class="wf-loading">
    <div class="fa fa-spinner fa-pulse fa-spin"></div>
  </div>
  <div class="wf-lock"></div>
</div>

<div id="wf-preview-template-image" class="wf-preview <?= implode(' ', $previewClasses) ?>" style="display: none;">
  <i class="wf-remove-preview fa fa-times cursor-pointer" data-id="0"></i>
  <a href="" data-lightbox="">
    <img class="wf-preview-image" src="" alt=""/>
  </a>
</div>

<div id="wf-preview-template-file" class="wf-preview <?= implode(' ', $previewClasses) ?>" style="display: none;">
  <i class="wf-remove-preview fa fa-times cursor-pointer" data-id="0"></i>
  <i class="fa fa-file-o" aria-hidden="true"></i>
  <span class="wf-preview-file-name text-center"></span>
</div>

<div id="wf-preview-select-file" class="wf-preview select-file <?= implode(' ', $dropZoneClasses) ?>"
     style="display: none;">
  <label for="<?= $attribute ?>-select">
    <i class="fa fa-plus"></i>
  </label>
  <input type="file" style="display: none" id="<?= $attribute ?>-select" multiple="multiple">
</div>

<div class="d-none">
    <?= Html::activeFileInput($model, $isMultiple ? $attribute.'[]' : $attribute, $options); ?>
</div>

<div class="wf-deletion-input-container">
    <?= Html::activeHiddenInput($model, $deletionInputName); ?>
</div>
