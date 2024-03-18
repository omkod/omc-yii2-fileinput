class WFileInput {

    errors = []
    params = {
        id: false,
        multiple: false,
        required: false,
        allowedFileExtensions: false,
        minFileCount: false,
        maxFileCount: false,
        maxFileSize: false,
        minImageHeight: false,
        maxImageHeight: false,
        minImageWidth: false,
        maxImageWidth: false,
        msgFileRequired: '',
        bootstrapVersion: 4
    }

    constructor(id, params) {
        this.id = id
        this.input = $('#' + id)
        this.$container = this.input.parents('.form-group.field-' + id)
        this.$form = this.$container.parents('form')
        this.$dropzone = this.$container.find('.wf-upload-container > .wf-drop-zone')
        this.$deletionInput = this.$container.find('.wf-deletion-input-container > input')
        this.params = params

        this.showLoading()

        setTimeout(() => {
            this.init()
            this.hideLoading()
        }, 1000)

        $.fn.wfileinput = function (option) {
            if (['getFileCount', 'lock', 'unlock'].some(item => item === option)) {
                return window['wfileinput_' + this.attr('id').replace('-', '_')][option]()
            }
        }
    }

    getFileCount = () => {
        return this.getFiles().length + this.$dropzone.find('.wf-preview.is-exists').length
    }

    lock() {
        this.$container.find('.wf-lock').fadeIn()
    }

    unlock() {
        this.$container.find('.wf-lock').fadeOut()
    }

    showLoading() {
        this.$container.find('.wf-loading').fadeIn()
    }

    hideLoading() {
        this.$container.find('.wf-loading').fadeOut()
    }

    init() {
        // https://lokeshdhakar.com/projects/lightbox2/#options
        lightbox.option({
            'resizeDuration': 200,
            'fadeDuration': 300,
            'showImageNumberLabel': false,
        });

        this.addInput()

        const errorContainerSelector = this.params.bootstrapVersion === 4 ? '.invalid-feedback' : '.help-block'
        const isAttributeExists = this.$form.data('yiiActiveForm').attributes.find(item => item.id === this.params.id)
        if (!isAttributeExists) {
            this.$form.yiiActiveForm('add', {
                id: this.params.id,
                name: this.input.attr('name'),
                container: '.field-' + this.params.id,
                input: '#' + this.params.id,
                error: errorContainerSelector,
                encodeError: false,
            });
        }

        this.$form.yiiActiveForm('find', this.params.id).validate = (attribute, value, messages) => {
            if (this.params.required) {
                const alreadyExistedFilesCount = this.getFiles().length
                const alreadySavedFilesCount = this.$dropzone.find('.wf-preview.is-exists').length
                if ((alreadyExistedFilesCount + alreadySavedFilesCount) === 0) {
                    yii.validation.addMessage(messages, this.params.msgFileRequired)
                    return false;
                }
            }
            if (this.params.minFileCount) {
                const alreadyExistedFilesCount = this.getFiles().length
                const alreadySavedFilesCount = this.$dropzone.find('.wf-preview.is-exists').length
                if (this.params.minFileCount > (alreadyExistedFilesCount + alreadySavedFilesCount)) {
                    yii.validation.addMessage(messages, 'Минимальное количество файлов: ' + this.params.minFileCount)
                    return false;
                }
            }
        }

        this.$dropzone
            .on('change', '.select-file', async event => {
                await this.sendFiles(event.originalEvent.target.files)
            })
            .on('ondragleave dragexit', event => {
                event.preventDefault()
                event.stopPropagation()
                this.$dropzone.removeClass('dragover')
            })
            .on('dragover', event => {
                event.preventDefault()
                event.stopPropagation()
                this.$dropzone.addClass('dragover')
            })
            .on('ondragenter', event => {
                event.preventDefault()
                event.stopPropagation()
                this.$dropzone.addClass('dragover')
            })
            .on('drop', async event => {
                event.preventDefault()
                event.stopPropagation()
                this.$dropzone.removeClass('dragover');
                await this.sendFiles(event.originalEvent.dataTransfer.files)
            })
            .on('click', '.wf-remove-preview', async event => {
                const previewIndex = $(event.currentTarget).data('id')
                const fileId = $(event.currentTarget).data('file-id')
                if (fileId) {
                    const preview = $(event.currentTarget).parent('.wf-preview')
                    preview.attr('data-toRemove', true)
                    if (this.$deletionInput.val() === '') {
                        this.$deletionInput.val(fileId)
                    } else {
                        const newDeletionInput = this.$deletionInput.clone()
                        newDeletionInput.val(fileId)
                        $('.wf-deletion-input-container').append(newDeletionInput)
                    }
                    this.updatePreview()
                } else {
                    this.removeFile(previewIndex)
                }
                await this.validate(this.getFiles(), false)
            })
    }

    addInput() {
        const fileCount = this.getFiles().length
        const maxFileCount = this.params.maxFileCount
        const alreadySavedFilesCount = this.$dropzone.find('.wf-preview.is-exists').length
        if (maxFileCount && (maxFileCount > (fileCount + alreadySavedFilesCount))) {
            const input = this.$container.find('#wf-preview-select-file').clone()
            this.$dropzone.append(input.show())
        }
    }

    async sendFiles(files) {
        files = this.params.multiple ? files : [files[0]]
        files = await this.validate(files)
        if (files.length) {
            const oldFiles = this.params.multiple ? this.getFiles() : []
            oldFiles.push(...files)
            this.setFiles(oldFiles)
        }
    }

    async validate(files, loadExisted = true) {
        this.errors = []
        const alreadyExistedFilesCount = loadExisted ? this.getFiles().length : 0
        const alreadySavedFilesCount = this.$dropzone.find('.wf-preview.is-exists').length
        const validatedFiles = []
        for (let i = 0; i < files.length; i++) {
            let isValidationPassed = true

            if (this.params.maxFileCount && this.params.multiple) {
                if ((alreadyExistedFilesCount + alreadySavedFilesCount + validatedFiles.length + 1) > this.params.maxFileCount) {
                    this.errors.push('Максимальное количество файлов: ' + this.params.maxFileCount)
                    isValidationPassed = false
                }
            }

            let file = files[i]

            if (this.params.allowedFileExtensions) {
                const isValid = this.params.allowedFileExtensions.some((item) => item === file.name.toLowerCase().split('.').pop())
                if (!isValid) {
                    this.errors.push('Разрешена загрузка следующих файлов: ' + this.params.allowedFileExtensions.join(', '))
                    isValidationPassed = false
                }
            }

            if (this.params.maxFileSize) {
                if (file.size > this.params.maxFileSize * 1024) {
                    this.errors.push('Максимальный размер файла: ' + this.params.maxFileSize + 'Kb')
                    isValidationPassed = false
                }
            }

            if (this.params.minFileSize) {
                if (file.size < this.params.minFileSize * 1024) {
                    this.errors.push('Минимальный размер файла: ' + this.params.minFileSize + 'Kb')
                    isValidationPassed = false
                }
            }

            if (
                this._isImage(file) &&
                (this.params.minImageHeight ||
                    this.params.maxImageHeight ||
                    this.params.minImageWidth ||
                    this.params.maxImageWidth)
            ) {
                const image = await this._loadImage(file)
                if (this.params.minImageHeight) {
                    if (image.height < this.params.minImageHeight) {
                        this.errors.push('Минимальная высота файла: ' + this.params.minImageHeight + 'px')
                        isValidationPassed = false
                    }
                }

                if (this.params.maxImageHeight) {
                    if (image.height > this.params.maxImageHeight) {
                        this.errors.push('Максимальная высота файла: ' + this.params.maxImageHeight + 'px')
                        isValidationPassed = false
                    }
                }

                if (this.params.minImageWidth) {
                    if (image.width < this.params.minImageWidth) {
                        this.errors.push('Минимальная ширина файла: ' + this.params.minImageWidth + 'px')
                        isValidationPassed = false
                    }
                }

                if (this.params.maxImageWidth) {
                    if (image.width > this.params.maxImageWidth) {
                        this.errors.push('Максимальная ширина файла: ' + this.params.maxImageWidth + 'px')
                        isValidationPassed = false
                    }
                }
            }

            if (isValidationPassed) {
                validatedFiles.push(file)
            }
        }

        this.showErrors()

        return validatedFiles
    }

    showErrors() {
        if (this.errors.length) {
            this.$form.yiiActiveForm('updateAttribute', this.params.id, [[...new Set(this.errors)].join('<br>')]);
        } else {
            this.$form.yiiActiveForm('updateAttribute', this.params.id, '');
        }
    }

    setFiles(files) {
        const dataTransfer = new DataTransfer()
        for (const file of files) {
            dataTransfer.items.add(file)
        }
        this.input[0].files = dataTransfer.files
        this.updatePreview()
    }

    getFiles() {
        const files = new Array(this.input[0].files.length)
        for (let i = 0; i < this.input[0].files.length; i++) {
            files[i] = this.input[0].files.item(i)
        }
        return Array.from(this.input[0].files)
    }

    removeFile(index) {
        const files = this.getFiles()
        files.splice(index, 1)
        this.setFiles(files)
    }

    updatePreview() {
        const files = this.getFiles()
        const oldCount = this.$dropzone.find('.wf-preview').not('#wf-preview-select-file').length

        this.$dropzone.find('.wf-preview').not('.is-exists').remove()
        this.$dropzone.find('.wf-preview.is-exists').each(function () {
            if ($(this).data('toremove')) {
                $(this).remove()
            }
        })

        if (!this.params.multiple) {
            this.$dropzone.html('')
        }

        files.forEach((file, index) => {
            if (file.type.match('image.*')) {
                const preview = $('#wf-preview-template-image').clone().removeAttr('id')
                preview.find('.wf-preview-image').attr('src', URL.createObjectURL(file))
                preview.find('a').attr('href', URL.createObjectURL(file))
                preview.find('a').attr('data-lightbox', index)
                preview.find('.wf-remove-preview').attr('data-id', index)
                this.$dropzone.append(preview.show())
            } else {
                const preview = $('#wf-preview-template-file').clone().removeAttr('id')
                preview.find('.wf-preview-file-name').text(file.name)
                preview.find('.wf-remove-preview').data('id', index)
                this.$dropzone.append(preview.show())
            }
        })

        const newCount = this.$dropzone.find('.wf-preview').not('#wf-preview-select-file').length

        if (oldCount > newCount) {
            this.input.trigger('onFileRemove')
        } else if (oldCount < newCount) {
            this.input.trigger('onFileAdd')
        } else {
            this.input.trigger('onFileReplace')
        }

        if (this.params.multiple || files.length === 0) {
            this.addInput()
        }
    }

    _isImage(file) {
        const result = file.type.match('image.*')
        if (result === null) {
            return false
        }

        if (result instanceof Array) {
            return result.length > 0
        }
    }

    async _loadImage(file) {
        return new Promise((resolve) => {
            const img = new Image();
            const objectUrl = window.URL.createObjectURL(file);
            img.onload = () => resolve(img)
            img.src = objectUrl
            window.URL.revokeObjectURL(objectUrl)
        })
    }
}