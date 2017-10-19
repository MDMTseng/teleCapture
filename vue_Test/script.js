var vm=new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue.js',
    message2: 'You loaded this page on ' + new Date(),
    seen: false,
    todos: [
      { text: 'Learn JavaScript' },
      { text: 'Learn Vue' },
      { text: 'Build something awesome' }
    ],
    fetching_lock:false
  },
  methods: {
    reverseMessage: function () {
      this.seen=~this.seen;
      this.message = this.message.split('').reverse().join('')
    },

    destroySelfX: function () {
      this.$destroy();
    },

    group1:()=>{
      GPMD.func1();
    },
    fetchJson:()=>{
      UTILITY.ajax_fix_gpmf2json("GET","data/MAG_Test156.MP4.json",{
        resolve:(data)=>{
          GPMD.extractIMUData(data);
        },
        reject:(data)=>{
          console.log(data);
        }
      })
    }
  },

  beforeCreated: function () {
    console.log('beforeCreated: ')
  },
  created: function () {
    // `this` points to the vm instance
    console.log('created: ')
  },
  beforeMount: function () {
    // `this` points to the vm instance
    console.log('beforeMount: ')
  },
  mounted: function () {
    // `this` points to the vm instance
    console.log('mounted: ')
    console.log(this)
  },
  beforeUpdate: function () {
    // `this` points to the vm instance
    console.log('beforeUpdate: ')
  },
  updated: function () {
    // `this` points to the vm instance
    console.log('updated: ')
  },
  beforeDestroy: function () {
    // `this` points to the vm instance
    console.log('beforeDestroy: ')
  } ,
  destroyed: function () {
    // `this` points to the vm instance
    console.log('destroyed: ')
  }
})


vm.$watch('message', function (newVal, oldVal) {
  console.log(newVal,"\n>",oldVal);
  // this callback will be called when `vm.a` changes
})
