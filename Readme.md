# FileInput

## Пример использования

```php
<?=$form->field($formModel, 'photos')->widget(FileInput::class, [
    'options'           => [
      'accept'   => 'image/*',
      'multiple' => TRUE,
    ],
    'deletionInputName' => 'photos_to_delete[]',
    'pluginOptions'     => [
      'showMsgDropZone'       => TRUE,
      'msgDropZone'           => 'Перетащите файлы сюда',
      'allowedFileExtensions' => [
        'jpg',
        'jpeg',
        'gif',
        'png',
      ],

      'required'              => TRUE,
      'msgFileRequired'      => 'Добавьте дополнительные фото.',
      'initialPreview'        => TRUE,
      'initialPreviewConfig'  => [
        'id'          => 'id',
        'path'        => 'file',
        'useThumbs'   => TRUE,
        'thumbWidth'  => 282,
        'thumbHeight' => 282,
        'filePath'    => '/photos',
        'thumbsPath'  => '/thumbs',
      ],

      'minFileCount'          => 2,
      'maxFileCount'          => 4,
      'minFileSize' => 100, //Kb
      'maxFileSize' => 2000, //Kb
      
      'minImageHeight' => 100, //Px
      'maxImageHeight' => 1000, //Px
      'minImageWidth' => 100, //Px
      'maxImageWidth' => 1000, //Px

      'uploadContainerClasses' => ['one-class', 'two-class'],
      'dropZoneClasses' => ['one-class', 'two-class'],
      'previewClasses' => ['one-class', 'two-class']
    ],
]);
?>
```

## Параметры

- **options** - массив параметров, предающихся непосредственно в тег input
  - accept - Устанавливает фильтр на типы файлов, которые вы можете отправить через поле загрузки файлов (<http://htmlbook.ru/html/input/accept>)
  - multiple - мультизагрузка файлов. Влияет на внешний вид инпута и атрибут name.
    при 'multiple' => TRUE при получении файла следует использовать UploadedFile::getInstances() , иначе UploadedFile::getInstance()
- **deletionInputName** - имя поля, в котором будет передаваться список файлов для удаления (в режиме редактирования).
  Необязательный параметр. По умолчанию равен **attribute + '_to_delete[]'**
- **pluginOptions** - массив настроек виджета
  - **showMsgDropZone** - Необязательный параметр. показывать текст в поле перетаскивания. По умолчанию TRUE.
  - **msgDropZone** - Необязательный параметр. текст в поле перетаскивания. По умолчанию "Перетащите файлы сюда".
  - **allowedFileExtensions** - массив разрешенных расширений файлов
  - **required** - Обязательный параметр. По умолчанию FALSE
  - **msgFileRequired** - Необязательный параметр. Сообщение о незаполненном инпуте (при required === TRUE)
  - **initialPreview** - Показывать превью загруженных ранее файлов (в режиме редактирования). По умолчанию TRUE
  - **initialPreviewConfig** - конфигурация превью (при initialPreview === TRUE)
    - **id**: атрибут модели, хранящий идентификатор. По умолчанию "id"
    - **path**: атрибут модели, хранящий путь к файлу. По умолчанию "file"
    - **filePath**:  Префикс для url файла (Например '/photos'). По умолчанию пустая строка,
    - **useThumbs**: Использовать генерацию превью, если доступно. По умолчанию FALSE
    - **thumbsPath**: Префикс для url превью. По умолчанию "/thumbs" (при useThumbs === TRUE)
    - **thumbWidth**:  Ширина превью в px (при useThumbs === TRUE)
    - **thumbHeight**: Высота превью в px (при useThumbs === TRUE)
  - **maxFileCount** - Обязательный параметр. Максимальное кол-во загружаемых файлов
  - **minFileCount** - Необязательный параметр. Минимальное кол-во загружаемых файлов
  - **maxFileSize** - Необязательный параметр. Максимальный размер файла в kb
  - **minFileSize** - Необязательный параметр. Минимальный размер файла в kb
  - **minImageHeight** - Необязательный параметр. Минимальная высота в px. Только для изображений.
  - **maxImageHeight** - Необязательный параметр. Максимальная высота в px. Только для изображений.
  - **minImageWidth** - Необязательный параметр. Минимальная ширина в px. Только для изображений.
  - **maxImageWidth** - Необязательный параметр. Максимальная ширина в px. Только для изображений.
  - **uploadContainerClasses** - Необязательный параметр. Массив дополнительных классов для .wf-upload-container
  - **dropZoneClasses** - Необязательный параметр. Массив дополнительных классов для .wf-drop-zone
  - **previewClasses** - Необязательный параметр. Массив дополнительных классов для .wf-preview

## Методы

- *$('#input_id').wfileinput('getFileCount')* - количество файлов в инпуте (включая добавленные ранее)
- *$('#input_id').wfileinput('lock')* - заблокировать
- *$('#input_id').wfileinput('unlock')* - разблокировать

## События

- *$('#input_id').on('onFileAdd', () => { // })* - файл добавлен
- *$('#input_id').on('onFileRemove', () => { // })* - файл удален
- *$('#input_id').on('onFileReplace', () => { // })* - файл заменен
