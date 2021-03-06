通过 Vue.js 的过渡系统，可以在元素从 DOM 中插入或移除时自动应用过渡效果。Vue.js 会在适当的时机为你触发 CSS 过渡或动画，你也可以提供相应的 JavaScript 钩子函数在过渡过程中执行自定义的 DOM 操作。

为了应用过渡效果，需要在目标元素上使用 transition 特性：

    <div v-if="show" transition="my-transition"></div>

transition 特性可以与下面资源一起用：

* v-if
* v-show
* v-for （只为插入和删除触发）
* 动态组件 （介绍见组件）
* 在组件的根节点上，并且被 Vue 实例 DOM 方法（如 vm.$appendTo(el)）触发。

当插入或删除带有过渡的元素时，Vue 将：

* 尝试以 ID "my-transition" 查找 JavaScript 过渡钩子对象——通过 Vue.transition(id, hooks) 或 transitions 选项注册。如果找到了，将在过渡的不同阶段调用相应的钩子。

* 自动嗅探目标元素是否有 CSS 过渡或动画，并在合适时添加/删除 CSS 类名。

* 如果没有找到 JavaScript 钩子并且也没有检测到 CSS 过渡/动画，DOM 操作（插入/删除）在下一帧中立即执行。

##CSS过渡

###示例

典型的 CSS 过渡像这样：

    <div v-if="show" transition="expand">hello</div>

然后为 .expand-transition, .expand-enter 和 .expand-leave 添加 CSS 规则:

    /* 必需 */
    .expand-transition {
      transition: all .3s ease;
      height: 30px;
      padding: 10px;
      background-color: #eee;
      overflow: hidden;
    }

    /* .expand-enter 定义进入的开始状态 */
    /* .expand-leave 定义离开的结束状态 */
    .expand-enter, .expand-leave {
      height: 0;
      padding: 0 10px;
      opacity: 0;
    }

###过渡的CSS类名

类名的添加和切换取决于 transition 特性的值。比如 transition="fade"，会有三个 CSS 类名：

* .fade-transition 始终保留在元素上。

* .fade-enter 定义进入过渡的开始状态。只应用一帧然后立即删除。

* .fade-leave 定义离开过渡的结束状态。在离开过渡开始时生效，在它结束后删除。

如果 transition 特性没有值，类名默认是 .v-transition, .v-enter 和 .v-leave。

###过渡流程详解

当 show 属性改变时，Vue.js 将相应地插入或删除 `<div>` 元素，按照如下规则改变过渡的 CSS 类名：

如果 show 变为 false，Vue.js 将：

    调用 beforeLeave 钩子；
    添加 v-leave 类名到元素上以触发过渡；
    调用 leave 钩子；
    等待过渡结束（监听 transitionend 事件）；
    从 DOM 中删除元素并删除 v-leave 类名；
    调用 afterLeave 钩子。

如果 show 变为 true，Vue.js 将：

    调用 beforeEnter 钩子；
    添加 v-enter 类名到元素上；
    把它插入 DOM；
    调用 enter 钩子；
    强制一次 CSS 布局，让 v-enter 确实生效。然后删除 v-enter 类名，以触发过渡，回到元素的原始状态；
    等待过渡结束；
    调用 afterEnter 钩子。

另外，如果在它的进入过渡还在进行中时删除元素，将调用 enterCancelled 钩子，以清理变动或 enter 创建的计时器。反过来对于离开过渡亦如是。

上面所有的钩子函数在调用时，它们的 this 均指向所属的 Vue 实例。如果元素是 Vue 实例的根节点，则这个实例是上下文。否则，上下文是过渡指令所属的实例。

最后，enter 和 leave 可以有第二个可选的回调参数，用于显式控制过渡如何结束。因此不必等待 CSS transitionend 事件， Vue.js 将等待你手工调用这个回调，以结束过渡。例如：

    enter: function (el) {
      // 没有第二个参数
      // 由 CSS transitionend 事件决定过渡何时结束
    }

vs.

    enter: function (el, done) {
      // 有第二个参数
      // 过渡只有在调用 `done` 时结束
    }

###CSS动画

CSS 动画用法同 CSS 过渡，区别是在动画中 v-enter 类名在节点插入 DOM 后不会立即删除，而是在 animationend 事件触发时删除。

    <span v-show="show" transition="bounce">Look at me!</span>

    

###javascript过渡

也可以只使用 JavaScript 钩子，不用定义任何 CSS 规则。当只使用 JavaScript 过渡时，enter 和 leave 钩子需要调用 done 回调，否则它们将被同步调用，过渡将立即结束。

为 JavaScript 过渡显式声明 css: false 是个好主意，Vue.js 将跳过 CSS 检测。这样也会阻止无意间让 CSS 规则干扰过渡。

在下例中我们使用 jQuery 注册一个自定义的 JavaScript 过渡：

    Vue.transition('fade', {
      css: false,
      enter: function (el, done) {
        // 元素已被插入 DOM
        // 在动画结束后调用 done
        $(el)
          .css('opacity', 0)
          .animate({ opacity: 1 }, 1000, done)
      },
      enterCancelled: function (el) {
        $(el).stop()
      },
      leave: function (el, done) {
        // 与 enter 相同
        $(el).animate({ opacity: 0 }, 1000, done)
      },
      leaveCancelled: function (el) {
        $(el).stop()
      }
    })

##渐进过渡

transition 与 v-for 一起用时可以创建渐近过渡。给过渡元素添加一个特性 stagger, enter-stagger 或 leave-stagger：

或者，提供一个钩子 stagger, enter-stagger 或 leave-stagger，以更好的控制：

    Vue.transition('stagger', {
      stagger: function (index) {
        // 每个过渡项目增加 50ms 延时
        // 但是最大延时限制为 300ms
        return Math.min(300, index * 50)
      }
    })
