//Vue.use() 方法会调用插件的 install 方法

//我需要获取离我最近带有滚动性质的盒子
function getScrollParent(el) {
    let parent = el.parentNode;
    while (parent) {
        //如果父元素有 scroll 或者是 auto 两个属性,则这就是我们需要获取的对象
        if (/(scroll)|(auto)/.test(getComputedStyle(parent)['overflow'])) {
            return parent;
        }
        //如果没有，我就继续向上查找
        parent = parent.parentNode;
    }
    //如果找不到我就直接返回 parent
    return undefined;
}

const loadImageAsync=(src,resolve,reject)=>{
    let image = new Image();
    image.src = src;
    image.onload = resolve;
    image.onerror = reject;
};

//把类都封装到函数中
const Lazy = () => {
    //我们可以把多个方法都写到这里面
    //每一个图片元素都构造成一个类的实例,因为类方便扩展，而且可以封装
    class ReactiveListener {
        constructor({el, src, options,elRender}) {
            this.el = el;
            this.src = src;
            this.options = options;
            //图片的状态，当前图片是加载中，还是加载完成
            this.state = {loading: false}; //还没有加载过
            this.elRender = elRender;
        }
        checkInView() { //检测图片是否在可视区域
            //获取当前元素距离顶部的距离
            let {top} = this.el.getBoundingClientRect();
            return top < window.innerHeight * (this.options.preLoad || 1.3);
        }
        load() {//用来加载这个图片
            //渲染之前我需要先加载loading
            this.elRender(this,'loading');
            //加载完成，显示正常图片
            //懒加载的核心就是 new image
            loadImageAsync(this.src,()=>{
                this.state.loading = true;
                this.elRender(this,'finish');
            },()=>{
                this.elRender(this,'error');
            })
        }
    }

    return class LazyClass {
        constructor(options) {
            //保存用户传入的属性
            this.options = options;
            //是否绑定过处理函数
            this.bindHandler = false;
            //为每个元素都创建一个实例，把所有的实例都存放到这个数组里面
            this.listenerQueue = [];

        }

        handleLazyLoad() {
            //在这里校验当前数组里面的哪些元素应该显示出来
            //检测当前数组的每一项是否在我的可视区域中,如果在的话，我就渲染，不然我就不渲染
            this.listenerQueue.forEach(listener => {
                if(!listener.state.loading){
                    let catIn = listener.checkInView();
                    //如果在可视区域中，我就去加载这个图片
                    catIn && listener.load();
                }
            });
        }

        add(el, bindings, vnode) {
            //找到具有 scroll 性质的父级元素
            Vue.nextTick(() => {
                //我需要获取离我最近带有滚动性质的盒子
                let scrollParent = getScrollParent(el);
                //bindHandler 的判断是为了防止多次绑定，耗费性能
                if (scrollParent && !this.bindHandler) {
                    this.bindHandler = true;
                    //监听滚动事件，处理懒加载
                    scrollParent.addEventListener('scroll', this.handleLazyLoad.bind(this));
                }
                //需要判断这个元素是否在当前容器的可视区域中，如果不是，就不用渲染
                const listener = new ReactiveListener({
                    el,
                    src: bindings.value, //bindings.value 就是 v-lay="img" 里面 img 的值
                    options: this.options,
                    elRender: this.elRender.bind(this)
                });
                //把所有的 img 都创建一个实例，并放到数组中，然后我们就需要判断一下，数组里面的哪些应该显示，哪些不应该显示
                this.listenerQueue.push(listener);
                this.handleLazyLoad();
            });
        }

        //渲染方法
        elRender(listener, state) {
            let el = listener.el;
            let src = '';
            switch (state) {
                case 'loading':
                    src = listener.options.loading || '';
                    break;
                case 'error':
                    src = listener.options.error || '';
                    break;
                default:
                    src = listener.src;
                    break;
            }
            el.setAttribute('src', src);
        }
    };
};

const VueLazyload = {
    install(Vue, options) {
        //这里用到了函数柯里化,我先把 Vue 保留到函数中，这样子我所有的类都可以用这个参数
        const LazyClass = Lazy(Vue);
        const lazy = new LazyClass(options);

        //定义一个全局的 lazy 指令
        Vue.directive('lazy', {
            //我们要写个工具，或者是写个库，这个东西肯定要进行封装
            //把所有逻辑进行封装，我们要封装的肯定是类，类可能有很多个，所以我们可以把类再封装到函数中
            bind: lazy.add.bind(lazy)
        });
    }
};

//TODO 通过节流来进行优化

