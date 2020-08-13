//Vue.use() 方法会调用插件的 install 方法

//我需要获取离我最近带有滚动性质的盒子
function getScrollParent(el){
    let parent = el.parentNode;
    while (parent){
        //如果父元素有 scroll 或者是 auto 两个属性,则这就是我们需要获取的对象
        if(/(scroll)|(auto)/.test(getComputedStyle(parent)['overflow'])){
            return parent;
        }
        //如果没有，我就继续向上查找
        parent = parent.parentNode;
    }
    //如果找不到我就直接返回 parent
    return undefined;
}


//把类都封装到函数中
const Lazy = () => {
    //我们可以把多个方法都写到这里面

    return class LazyClass {
        constructor(options){
            //保存用户传入的属性
            this.options = options;

        }
        add(el,bindings,vnode){
            //找到具有 scroll 性质的父级元素
            Vue.nextTick(()=>{
                //我需要获取离我最近带有滚动性质的盒子
                let scrollParent = getScrollParent(el);
                if(scrollParent){
                    console.log(scrollParent);
                }

            })
        }
    }
};

const VueLazyload = {
    install(Vue, options) {

        //这里用到了函数柯里化,我先把 Vue 保留到函数中，这样子我所有的类都可以用这个参数
        const LazyClass = Lazy(Vue);
        const lazy =  new LazyClass(options);

        //定义一个全局的 lazy 指令
        Vue.directive('lazy', {
            //我们要写个工具，或者是写个库，这个东西肯定要进行封装
            //把所有逻辑进行封装，我们要封装的肯定是类，类可能有很多个，所以我们可以把类再封装到函数中
            bind:lazy.add.bind(lazy)



        });
    }
};
