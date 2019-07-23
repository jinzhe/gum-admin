<template>
  <div class="tinymce-editor">
    <editor v-model="myValue" :init="init" :disabled="disabled" @onClick="onClick"></editor>
  </div>
</template>

<script>
import tinymce from "tinymce/tinymce";
import Editor from "@tinymce/tinymce-vue";
import "tinymce/themes/modern/theme";
import "tinymce/plugins/image";
import "tinymce/plugins/code";
import "tinymce/plugins/codesample";

import "tinymce/plugins/autolink";
import "tinymce/plugins/link";
import "tinymce/plugins/media";
import "tinymce/plugins/table";
import "tinymce/plugins/lists";
import "tinymce/plugins/media";
import "tinymce/plugins/preview";
import "tinymce/plugins/contextmenu";
import "tinymce/plugins/wordcount";
import "tinymce/plugins/paste";
// import "tinymce/plugins/imagetools";
import "tinymce/plugins/colorpicker";
import "tinymce/plugins/textcolor";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/print";
import "tinymce/plugins/tabfocus";
import "tinymce/plugins/charmap";

export default {
  components: {
    Editor
  },
  props: {
    //传入一个value，使组件支持v-model绑定
    value: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
    plugins: {
      type: [String, Array],
      default:
        "print tabfocus preview fullscreen autolink link charmap lists image code codesample media table colorpicker textcolor wordcount contextmenu media paste"
    },
    //formatselect fontsizeselect print undo redo |
    toolbar: {
      type: [String, Array],
      default:
        "formatselect bold italic underline strikethrough  forecolor backcolor | align bullist numlist outdent indent blockquote | link table image media | print  pastetext fullscreen code"
    }
  },
  data() {
    return {
      //初始化配置
      init: {
        convert_urls: false,
        codesample_dialog_width: 1000,
        codesample_dialog_height: 400,
        force_p_newlines: false,
        language_url: "tinymce/langs/zh_CN.js",
        language: "zh_CN",
        skin_url: "tinymce/skins/lightgray",
        height: 360,
        plugins: this.plugins,
        toolbar1:
          " formatselect fontsizeselect link table image media pastetext code codesample fullscreen print charmap preview autolink colorpicker",
        toolbar2:
          " bold italic underline strikethrough  forecolor backcolor align bullist numlist outdent indent blockquote",
        branding: false,
        menubar: false,
        //此处为图片上传处理函数，这个直接用了base64的图片形式上传图片，
        //如需ajax上传可参考https://www.tiny.cloud/docs/configure/file-image-upload/#images_upload_handler
        // images_upload_handler: (blobInfo, success, failure) => {
        //   const img = "data:image/jpeg;base64," + blobInfo.base64();
        //   success(img);
        // },
        paste_data_images: true
      },
      myValue: this.value
    };
  },
  mounted() {
    tinymce.init({});
  },
  methods: {
    //添加相关的事件，可用的事件参照文档=> https://github.com/tinymce/tinymce-vue => All available events
    //需要什么事件可以自己增加
    onClick(e) {
      this.$emit("onClick", e, tinymce);
    }
  },
  watch: {
    value(newValue) {
      this.myValue = newValue;
    },
    myValue(newValue) {
      this.$emit("input", newValue);
    }
  }
};
</script>
