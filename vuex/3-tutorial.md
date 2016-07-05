在没有 Vuex 的日子里

* Increment 与 Display 彼此无法感知到彼此的存在，也无法相互传递消息。是怎样的孤独。
* App 将必须通过事件(events)与广播(broadcasts)与其他两个组件进行协调。
* 而 App 作为二者之间的协调者，导致这些组件并没法被复用，被迫紧密耦合。调整应用的结构，则可能导致应用崩溃。

<img src="vuex_flow.png">

仅仅为了增加计数而采取这么多步骤显然很多余。但请注意，这些概念的引入是为了构建大型应用，提高可维护性，降低调试与长期维护的难度而设计的。（译注：换言之，这是屠龙刀，拿来杀鸡只是为了让我们好懂）好，那么接下来我们就用 vuex 来进行重构吧！