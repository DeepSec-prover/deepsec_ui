const mixin = {
  props: {
    dataPopper: {
      type: Object
    },
    isVisible: {
      type: Boolean,
      require: true
    },
    initialLeft: {
      type: Number,
      require: true
    }
  },
  data () {
    return {
      dataDrag: null,
      options: { buttonPin: false, buttonClose: false, left: 0, top: 0, dragCursor: '-moz-grab'},
      marginDragBot: 25,
      marginDragTop: 5,
      marginDragLeft: 15,
      marginDragRight: 25,
    }
  },
  methods: {
    updatePopper () {
      let options = this.options
      this.reconfigure(this.dataPopper,this.dataDrag,options)
      this.options = Object.assign({},options)
    },
    setOffset (data) {
      this.dataDrag = {
        left: data.left,
        top: data.top
      }
      let options = this.options
      this.reconfigure (this.dataPopper,this.dataDrag,options)
      this.options = Object.assign({},options)
        // Seems that just updating the value of options does not work. Creating
        // a completely new option seems to trigger an update correctly.
        // Trick obtained on Github by the creator of dialog-drag
    },
    reconfigure (dataPopper,dataDrag,options) {
      if (!dataDrag) {
        dataDrag = { left: 0, top: 0 }
        this.dataDrag = { left: 0, top: 0 }
      }

      const width = this.$refs.dragBox.clientWidth
      const height = this.$refs.dragBox.clientHeight

      if (dataPopper.top + dataDrag.top < this.marginDragTop) {
        options.top = this.marginDragTop - dataPopper.top
      } else if (dataPopper.top + dataDrag.top + height > dataPopper.heightWindow - this.marginDragBot) {
        options.top = dataPopper.heightWindow - this.marginDragBot - height - dataPopper.top
      } else {
        options.top = dataDrag.top
      }
      if (dataPopper.left + dataDrag.left < this.initialLeft + this.marginDragLeft) {
        options.left = this.initialLeft + this.marginDragLeft - dataPopper.left
      } else if (dataPopper.left + dataDrag.left + width > dataPopper.widthWindow + this.initialLeft - this.marginDragRight) {
        options.left = this.initialLeft + dataPopper.widthWindow - this.marginDragRight - dataPopper.left - width
      } else {
        options.left = dataDrag.left
      }
    }
  },
  watch: {
    dataPopper (newVal, _) {
      let options = this.options
      this.reconfigure(newVal,this.dataDrag,options)
      this.options = Object.assign({},options)
    },
    isVisible (bool) {
      if (!bool) {
        this.dataDrag = { top: 0, left: 0 }
      }
    }
  }
}

export default mixin
