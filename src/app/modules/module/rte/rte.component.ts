import {
    AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChange,
    SimpleChanges
} from "@angular/core";
import 'tinymce';
import 'tinymce/themes/modern';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/code';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/help';
import 'tinymce/plugins/contextmenu';
import 'tinymce/plugins/table';
import 'tinymce/plugins/advlist';

declare const tinymce: any;

@Component({
    selector: 'app-tiny-editor',
    template: `<textarea id="{{elementId}}"></textarea>`
})
export class RteComponent implements OnDestroy, AfterViewInit, OnChanges {
    @Input() elementId: String;
    @Output() onEditorContentChange = new EventEmitter();
    @Input() editMode: boolean;
    editor;
    @Input() rteData: EventEmitter<string>;
    editorInit = 0;


    ngAfterViewInit() {
        console.log(this.editMode);
        tinymce.init({
            selector: '#' + this.elementId,
            theme: 'modern',
            plugins: [
                'advlist lists link anchor table paste code help contextmenu'
            ],
            toolbar: ['formatselect | bold italic strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent | removeformat | table | code | contextmenu'],
            skin_url: '/assets/skins/lightgray',
            height: 300,
            branding: false,
            menubar: false,
            setup: editor => {
                console.log(' setup');
                this.editor = editor;
                let edit = this.editMode ? 'design' : 'readonly';
                editor.setMode(edit);
                editor.on('init', () => {
                    this.editor.setContent(this.rteData);
                    this.editorInit++;
                });
                editor.on('keyup change', () => {
                    const content = editor.getContent();
                    this.onEditorContentChange.emit(content);
                });
            },
        });
    }

    ngOnChanges() {
        if (this.editMode && this.editorInit == 1) {
            tinymce.activeEditor.setMode('design');
            this.editorInit++;
        }
        else if (!this.editMode && this.editorInit >= 2) {
            tinymce.activeEditor.setMode('readonly');
            this.editorInit--;
        }
    }

    ngOnDestroy() {
        console.log('destroy rte');
        tinymce.remove(this.editor);
    }
}