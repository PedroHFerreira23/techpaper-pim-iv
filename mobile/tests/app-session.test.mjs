import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { addItem, createApi, normalizeUrl, positiveInteger } from '../src/api.mjs';
import { createSessionScope } from '../src/session.mjs';
const require=createRequire(import.meta.url),expoRequire=createRequire(require.resolve('expo'));
const source=readFileSync(new URL('../App.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replace('export default function App()', 'function App()').replace('  const filtered = data.produtos.filter', '  globalThis.appTest = { enter, logout, sync, updatePreferences, setLogin, setPassword, setRelatoDescricao, setCliente, setCart, setDetail, state: {session, data, relatoDescricao, cliente, cart, detail, loading, notice} };\n  const filtered = data.produtos.filter');
const code=expoRequire('@babel/core').transformSync(source,{configFile:false,babelrc:false,plugins:[expoRequire.resolve('@babel/plugin-transform-react-jsx')]}).code;
function harness(fetcher, initial={}) {
 let cursor=0,first=true;const slots=[],effects=[],secure=new Map(initial.secure||[]),cache=new Map(initial.cache||[]);
 const storage=map=>({getItemAsync:async key=>map.get(key)??null,setItemAsync:async(key,value)=>{map.set(key,value);},deleteItemAsync:async key=>{map.delete(key);},getItem:async key=>map.get(key)??null,setItem:async(key,value)=>{map.set(key,value);},removeItem:async key=>{map.delete(key);}});
 const context=vm.createContext({console,URL,AbortController,process:{env:{}},__DEV__:true,
 createSessionScope,addItem,createApi:(base,token)=>createApi(base,token,fetcher),normalizeUrl,positiveInteger,
 useState(initial){const index=cursor++;if(!(index in slots))slots[index]=initial;return [slots[index],value=>{slots[index]=typeof value==='function'?value(slots[index]):value;}];},
 useRef(initial){const index=cursor++;if(!(index in slots))slots[index]={current:initial};return slots[index];},
 useEffect(callback){if(first)effects.push(callback);},useMemo:callback=>callback(),createContext:()=>({Provider:'provider'}),useContext:()=>null,
 React:{createElement:(type,props,...children)=>({type,props,children})},SecureStore:storage(secure),AsyncStorage:storage(cache),Crypto:{randomUUID:()=>crypto.randomUUID()},
 StyleSheet:{create:value=>value},Platform:{OS:'android'},Alert:{alert(){}},BackHandler:{addEventListener:()=>({remove(){}})},AppState:{addEventListener:()=>({remove(){}})},setInterval:()=>1,clearInterval(){},require:()=>({})});
 for(const name of ['ActivityIndicator','Image','KeyboardAvoidingView','Pressable','RefreshControl','ScrollView','NativeText','TextInput','View','SafeAreaProvider','SafeAreaView','StatusBar','Svg','Circle'])context[name]=name;
 vm.runInContext(code,context);let tree;
 const render=()=>{cursor=0;tree=vm.runInContext('TechPaper()',context);first=false;return context.appTest;};render();
 return {render,secure,cache,effects,tree:()=>tree};
}
const response=(status,data)=>({ok:status<400,status,json:async()=>data});
const user={id:1,name:'A',role:'Admin',avatarId:1,avatarSelecionado:true},current={token:'token-A',user,expiresAt:'2099-01-01T00:00:00Z'};
const successful=async url=>response(200,url.endsWith('/usuarios/login')?{usuario:user,accessToken:'token-A',expiraEm:current.expiresAt}:url.endsWith('/usuarios/me')?user:[]);
test('componente limpa relato não enviado, carrinho e detalhe ao sair',async()=>{
 const h=harness(successful);await h.render().enter();let app=h.render();app.setRelatoDescricao('Relato privado A');app.setCliente('Cliente A');app.setCart([{produtoId:1,quantidade:1}]);app.setDetail({id:9});
 await h.render().logout();const state=h.render().state;assert.equal(state.session,null);assert.equal(state.relatoDescricao,'');assert.equal(state.cliente,'');assert.equal(state.cart.length,0);assert.equal(state.detail,null);assert.equal(h.secure.has('tp_session'),false);
});
test('restauração com 401 remove cache da conta restaurada',async()=>{
 const h=harness(async()=>response(401,{message:'Sessão revogada'}),{secure:[['tp_session',JSON.stringify(current)]],cache:[['tp_cache_1',JSON.stringify({savedAt:new Date().toISOString(),data:{produtos:[{id:8}],movimentacoes:[],orcamentos:[],relatos:[]}})]]});
 h.effects[0]();for(let i=0;i<30&&h.render().state.loading;i++)await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.render().state.session,null);assert.equal(h.cache.has('tp_cache_1'),false);assert.equal(h.secure.has('tp_session'),false);
});
test('sync atrasado não restaura conta após logout no componente',async()=>{
 let delay=false;const pending=[];const h=harness(url=>delay&&!url.endsWith('/logout')?new Promise(resolve=>pending.push(()=>resolve(response(200,url.endsWith('/me')?user:[])))):successful(url));
 await h.render().enter();delay=true;const syncing=h.render().sync();await h.render().logout();for(const resolve of pending)resolve();await syncing;
 assert.equal(h.render().state.session,null);assert.equal(h.secure.has('tp_session'),false);assert.equal(h.cache.has('tp_cache_1'),false);
});
function find(tree,predicate){if(!tree||typeof tree!=='object')return false;if(predicate(tree))return true;return (tree.children||[]).flat(Infinity).some(child=>find(child,predicate));}
test('onboarding renderiza erro de avatar e oferece saída',async()=>{
 const firstUser={...user,avatarSelecionado:false};const h=harness(async url=>url.endsWith('/me/preferencias')?response(503,{message:'Falha ao salvar avatar'}):response(200,url.endsWith('/login')?{usuario:firstUser,accessToken:'token-A'}:url.endsWith('/me')?firstUser:[]));
 h.effects[0]();await new Promise(resolve=>setImmediate(resolve));
 await h.render().enter();await h.render().updatePreferences({temaEscuro:false,avatarId:2});h.render();
 assert.equal(h.render().state.notice,'Falha ao salvar avatar');
 assert.ok(find(h.tree(),node=>node.props?.accessibilityRole==='alert'&&node.children.includes('Falha ao salvar avatar')));
 assert.ok(find(h.tree(),node=>node.props?.title==='Sair da conta'));await h.render().logout();assert.equal(h.render().state.session,null);
});
