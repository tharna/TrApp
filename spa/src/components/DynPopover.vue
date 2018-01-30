<template>
  <div class="dynamic-popover">
    <el-popover
      ref="dynamic"
      placement="left"
      width="350"
      trigger="hover">
      {{ content }}
    </el-popover>
    <i class="el-icon-document" v-popover:dynamic></i>
  </div>
</template>
<script>
export default {
  name: 'dynamic',
  props: {
    index: 0,
    content: ''
  }
}
</script>
