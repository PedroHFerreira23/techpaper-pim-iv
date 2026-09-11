import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, BackHandler, Image, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text as NativeText, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import Svg, { Circle } from 'react-native-svg';
import { addItem, createApi, normalizeUrl, positiveInteger } from './src/api.mjs';

// O endereço pertence à configuração técnica do aplicativo e nunca é solicitado ao usuário.
const API_URL = normalizeUrl(process.env.EXPO_PUBLIC_API_URL || 'https://techpaper-pim-iv.onrender.com', __DEV__);
const money = value => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const parseApiDate = value => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') { const date = new Date(value < 1e12 ? value * 1000 : value); return Number.isNaN(date.getTime()) ? null : date; }
  let text = String(value).trim();
  const brazilian = text.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[ ,T]+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (brazilian) { const [, day, month, year, hour = '00', minute = '00', second = '00'] = brazilian; const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}-03:00`); return Number.isNaN(date.getTime()) ? null : date; }
  text = text.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00').replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
  if (!/(?:z|[+-]\d{2}:?\d{2})$/i.test(text)) text += 'Z';
  const date = new Date(text); return Number.isNaN(date.getTime()) ? null : date;
};
const formatDateTime = value => { const date = parseApiDate(value); return date ? date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'Data não informada'; };
const tabs = ['Resumo', 'Produtos', 'Estoque', 'Orçamentos', 'Conta'];
const avatars = [
  { id: 1, symbol: '👩🏻‍🦱', label: 'Pessoa de pele clara e cabelo cacheado' },
  { id: 2, symbol: '👨🏼‍🦰', label: 'Pessoa de pele clara média e cabelo ruivo' },
  { id: 3, symbol: '🧑🏽‍🦱', label: 'Pessoa de pele média e cabelo cacheado' },
  { id: 4, symbol: '👩🏾‍🦱', label: 'Pessoa de pele morena e cabelo crespo' },
  { id: 5, symbol: '👨🏿‍🦲', label: 'Pessoa de pele escura e cabeça raspada' },
  { id: 6, symbol: '🧕🏽', label: 'Pessoa de pele média usando lenço' },
];
const educationalMessages = [
  'Respeito não tem cor: atitudes inclusivas tornam a equipe mais forte.',
  'Discriminação racial deve ser reconhecida, interrompida e comunicada.',
  'Valorizar diferentes histórias e culturas melhora o ambiente de trabalho.',
  'Escute com respeito, evite estereótipos e pratique a igualdade de oportunidades.',
];
const ThemeContext = createContext(null);
function useTheme() { return useContext(ThemeContext); }
function Text({ style, ...props }) { const { s } = useTheme(); return <NativeText style={[s.text, style]} {...props} />; }
function Button({ title, onPress, disabled, secondary = false, accessibilityLabel = title, accessibilityHint }) {
  const { s } = useTheme();
  return <Pressable accessibilityLabel={accessibilityLabel} accessibilityHint={accessibilityHint} accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} style={[s.button, secondary && s.secondary, disabled && s.disabled]}><Text style={[s.buttonText, secondary && s.secondaryText]}>{title}</Text></Pressable>;
}
function Field({ label, ...props }) {
  const { s, colors } = useTheme(); const search = /buscar|pesquisar/i.test(label);
  return <View style={s.field}><Text style={s.label}>{label}</Text><TextInput accessibilityRole={search ? 'search' : 'none'} accessibilityLabel={label} placeholderTextColor={colors.muted} style={s.input} {...props} /></View>;
}
function Card({ children }) { const { s } = useTheme(); return <View style={s.card}>{children}</View>; }
function Avatar({ id, size = 'normal' }) { const { s } = useTheme(); const avatar = avatars.find(item => item.id === id) || avatars[0]; return <View accessible accessibilityRole="image" accessibilityLabel={avatar.label} style={[s.avatar, size === 'small' && s.avatarSmall]}><NativeText style={size === 'small' ? s.avatarSymbolSmall : s.avatarSymbol}>{avatar.symbol}</NativeText></View>; }
function EducationalBanner({ message }) { const { s } = useTheme(); return <View accessible accessibilityRole="summary" accessibilityLabel={`Mensagem de inclusão: ${message}`} style={s.educationalBanner}><Text style={s.bannerTitle}>Respeito e diversidade</Text><Text style={s.bannerText}>{message}</Text></View>; }
/*
 * Os gráficos recebem somente dados já sincronizados pela camada de API. Essa
 * separação mantém o componente visual sem regras de persistência e facilita
 * testes, manutenção e reutilização, conforme a responsabilidade única.
 */
function DashboardCharts({ produtos, movimentacoes }) {
  const { s, colors } = useTheme();
  const palette = ['#1E6B91', '#2AA889', '#E9A23B', '#775DA6', '#D45B4C', '#5F7890'];
  const totals = produtos.reduce((result, product) => { const category = product.categoria || 'Sem categoria'; result[category] = (result[category] || 0) + Number(product.estoque || 0); return result; }, {});
  const categories = Object.entries(totals); const total = categories.reduce((sum, [, value]) => sum + value, 0);
  const size = 176; const stroke = 24; const radius = (size - stroke) / 2; const circumference = 2 * Math.PI * radius; let offset = 0;
  const movementTotals = movimentacoes.reduce((result, movement) => { if (movement.tipo === 'Entrada') result.Entrada += Number(movement.quantidade); if (movement.tipo === 'Saida') result.Saida += Number(movement.quantidade); return result; }, { Entrada: 0, Saida: 0 });
  const maximum = Math.max(1, movementTotals.Entrada, movementTotals.Saida);
  const categoryLabel = categories.length ? categories.map(([name, value]) => `${name}: ${value} unidades`).join(', ') : 'Sem estoque cadastrado';
  return <>
    <Card><Text style={s.subtitle}>Estoque por categoria</Text><Text style={s.muted}>Quantidade disponível em cada grupo</Text>
      <View accessible accessibilityRole="image" accessibilityLabel={`Gráfico de rosca. ${categoryLabel}`} style={s.donutLayout}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.border} strokeWidth={stroke} />
          {categories.map(([name, value], index) => { const length = total ? value / total * circumference : 0; const circle = <Circle key={name} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={palette[index % palette.length]} strokeWidth={stroke} strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} rotation="-90" origin={`${size / 2}, ${size / 2}`} />; offset += length; return circle; })}
        </Svg>
        <View style={s.legend}>{categories.map(([name, value], index) => <View key={name} style={s.legendRow}><View style={[s.legendDot, { backgroundColor: palette[index % palette.length] }]} /><Text style={s.legendText}>{name}</Text><Text style={s.legendValue}>{value}</Text></View>)}</View>
      </View>
    </Card>
    <Card><Text style={s.subtitle}>Volume de movimentações</Text><Text style={s.muted}>Comparação do histórico de entradas e saídas</Text>
      <View accessible accessibilityRole="image" accessibilityLabel={`Gráfico de barras. Entradas: ${movementTotals.Entrada} unidades. Saídas: ${movementTotals.Saida} unidades.`} style={s.barChart}>
        {[['Entrada', movementTotals.Entrada, '#2AA889'], ['Saída', movementTotals.Saida, '#D45B4C']].map(([label, value, color]) => <View key={label} style={s.barRow}><View style={s.barLabel}><Text>{label}</Text><Text style={s.label}>{value} un.</Text></View><View style={s.barTrack}><View style={[s.barFill, { width: `${value / maximum * 100}%`, backgroundColor: color }]} /></View></View>)}
      </View>
    </Card>
  </>;
}
export default function App() { return <SafeAreaProvider><TechPaper /></SafeAreaProvider>; }
function TechPaper() {
  const [login, setLogin] = useState(''); const [password, setPassword] = useState('');
  const [session, setSession] = useState(null); const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false); const lock = useRef(false); const syncing = useRef(false);
  const [tab, setTab] = useState('Resumo'); const [notice, setNotice] = useState('');
  const [data, setData] = useState({ produtos: [], movimentacoes: [], orcamentos: [] });
  const [lastSync, setLastSync] = useState(null); const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState(''); const [selected, setSelected] = useState(null);
  const [tipo, setTipo] = useState('Entrada'); const [quantidade, setQuantidade] = useState('1'); const [motivo, setMotivo] = useState('');
  const [pending, setPending] = useState(null);
  const [cliente, setCliente] = useState(''); const [validade, setValidade] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [cart, setCart] = useState([]); const [detail, setDetail] = useState(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const darkMode = !!session?.user?.temaEscuro;
  const theme = useMemo(() => createTheme(darkMode), [darkMode]); const s = theme.s;
  const themed = child => <ThemeContext.Provider value={theme}>{child}</ThemeContext.Provider>;
  const api = current => createApi(API_URL, current.token);
  const pendingKey = current => `tp_pending_${current.user.id}`;

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync('tp_session');
        if (saved) {
          const current = JSON.parse(saved); const user = await api(current)('usuarios/me');
          current.user = user; setSession(current); await restorePending(current); await sync(current);
        }
      } catch (e) { setNotice(e.message); } finally { setLoading(false); }
    })();
  }, []);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (detail) { setDetail(null); return true; }
      if (tab !== 'Resumo') { setTab('Resumo'); return true; } return false;
    }); return () => subscription.remove();
  }, [tab, detail]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => { if (state === 'active' && session && !lock.current) sync(session); });
    return () => subscription.remove();
  }, [session]);
  useEffect(() => {
    const timer = setInterval(() => setBannerIndex(index => (index + 1) % educationalMessages.length), 8000);
    return () => clearInterval(timer);
  }, []);
  async function restorePending(current) {
    const value = await SecureStore.getItemAsync(pendingKey(current)); setPending(value ? JSON.parse(value) : null);
  }
  async function fail(e) {
    setNotice(e.message);
    if (e.status === 401) { await SecureStore.deleteItemAsync('tp_session'); setSession(null); setData({ produtos: [], movimentacoes: [], orcamentos: [] }); setLastSync(null); }
  }
  async function sync(current = session) {
    if (!current || syncing.current) return;
    syncing.current = true; setRefreshing(true);
    try {
      const request = api(current);
      const [produtos, movimentacoes, orcamentos, user] = await Promise.all([request('produtos'), request('movimentacoes'), request('orcamentos'), request('usuarios/me')]);
      const updated = { ...current, user }; setSession(updated); await SecureStore.setItemAsync('tp_session', JSON.stringify(updated));
      setData({ produtos, movimentacoes, orcamentos }); setLastSync(new Date()); setNotice('');
    } catch (e) { await fail(e); } finally { syncing.current = false; setRefreshing(false); }
  }
  async function run(action) {
    if (lock.current) return; lock.current = true; setBusy(true); setNotice('');
    try { await action(); } catch (e) { await fail(e); } finally { lock.current = false; setBusy(false); }
  }
  async function enter() {
    await run(async () => {
      const response = await createApi(API_URL)('usuarios/login', { method: 'POST', body: { login: login.trim(), password } });
      const current = { token: response.accessToken, user: response.usuario };
      await SecureStore.setItemAsync('tp_session', JSON.stringify(current));
      setSession(current); setPassword(''); await restorePending(current); await sync(current);
    });
  }
  async function logout() {
    await run(async () => {
      await api(session)('usuarios/logout', { method: 'POST' });
      await SecureStore.deleteItemAsync('tp_session'); setSession(null); setData({ produtos: [], movimentacoes: [], orcamentos: [] });
      setLastSync(null); setPending(null); setCart([]); setDetail(null); setCliente(''); setSelected(null); setTab('Resumo');
    });
  }
  // A preferência é gravada na API e acompanha o usuário em qualquer aparelho.
  async function updatePreferences(next) {
    await run(async () => {
      const user = await api(session)('usuarios/me/preferencias', { method: 'PATCH', body: { temaEscuro: next.temaEscuro, avatarId: next.avatarId } });
      const current = { ...session, user }; setSession(current); await SecureStore.setItemAsync('tp_session', JSON.stringify(current));
    });
  }
  async function move() {
    await run(async () => {
      if (!pending && (!selected || !motivo.trim())) throw new Error('Selecione um produto e informe o motivo.');
      const body = pending || { produtoId: selected, tipo, quantidade: positiveInteger(quantidade), motivo: motivo.trim(), chaveOperacao: Crypto.randomUUID() };
      await SecureStore.setItemAsync(pendingKey(session), JSON.stringify(body)); setPending(body);
      try { await api(session)('movimentacoes', { method: 'POST', body }); }
      catch (e) {
        if ([400, 403, 404, 409].includes(e.status)) { await SecureStore.deleteItemAsync(pendingKey(session)); setPending(null); }
        throw e;
      }
      await SecureStore.deleteItemAsync(pendingKey(session)); setPending(null); setMotivo(''); setQuantidade('1'); await sync();
      Alert.alert('Estoque atualizado', 'Movimentação confirmada pelo servidor.');
    });
  }
  async function saveQuote() {
    await run(async () => {
      if (!cliente.trim() || !cart.length || !/^\d{4}-\d{2}-\d{2}$/.test(validade)) throw new Error('Informe cliente, validade (AAAA-MM-DD) e pelo menos um item.');
      const created = await api(session)('orcamentos', { method: 'POST', body: { cliente: cliente.trim(), validade, itens: cart } });
      setCart([]); setCliente(''); setDetail(created); await sync();
    });
  }
  const filtered = data.produtos.filter(p => `${p.nome} ${p.sku}`.toLowerCase().includes(search.toLowerCase()));
  const canApprove = ['Admin', 'Supervisor'].includes(session?.user.role);
  const picker = <>
    <Field label="Pesquisar produto" value={search} onChangeText={setSearch} />
    {filtered.map(p => <Pressable key={p.id} accessibilityLabel={`${p.nome}, SKU ${p.sku}, saldo ${p.estoque}`} accessibilityRole="radio" accessibilityState={{ checked: selected === p.id, disabled: !!pending }} disabled={!!pending} onPress={() => setSelected(p.id)} style={[s.product, selected === p.id && s.selected]}>
      <Text style={s.label}>{p.nome}</Text><Text style={s.muted}>{p.sku} · Saldo {p.estoque} · {money(p.precoVenda)}</Text>
    </Pressable>)}
  </>;
  if (loading) return themed(<SafeAreaView style={s.screen}><ActivityIndicator size="large" accessibilityLabel="Abrindo TechPaper" /></SafeAreaView>);
  if (!session) return themed(<SafeAreaView style={s.screen}><StatusBar style={darkMode ? 'light' : 'dark'} /><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.flex}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <Image source={require('./assets/techpaper-logo-v4.png')} style={s.logoFull} resizeMode="contain" accessibilityLabel="TechPaper, papelaria no digital" /><Text accessibilityRole="header" style={s.title}>Sua papelaria,{ '\n' }sempre conectada.</Text><Text style={s.muted}>Acesso exclusivo para a equipe.</Text>
    {notice ? <Text accessibilityRole="alert" style={s.notice}>{notice}</Text> : null}
    <Card><Field label="E-mail" value={login} onChangeText={setLogin} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <Field label="Senha" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete="password" />
      <Button title={busy ? 'Entrando…' : 'Entrar'} onPress={enter} disabled={busy || !login || !password} />
    </Card><Text style={s.muted}>As credenciais de acesso são fornecidas pelo administrador da papelaria.</Text>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>);
  // O primeiro acesso permanece bloqueado até uma representação ser escolhida.
  if (!session.user.avatarSelecionado) return themed(<SafeAreaView style={s.screen}><StatusBar style={darkMode ? 'light' : 'dark'} /><ScrollView contentContainerStyle={s.onboardingContent}>
    <View style={s.brandRow}><Image source={require('./assets/techpaper-symbol-v4.png')} style={s.logoSmall} accessibilityLabel="Símbolo TechPaper" /><Text style={s.brand}>TechPaper</Text></View>
    <Card><Text accessibilityRole="header" style={s.title}>Escolha como aparecer</Text><Text style={s.muted}>Para continuar, selecione um avatar que represente você. A escolha pode ser alterada depois na tela Conta.</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Escolha obrigatória de avatar" style={s.avatarGallery}>{avatars.map(item => <Pressable key={item.id} accessibilityLabel={item.label} accessibilityRole="radio" accessibilityState={{ checked: false, disabled: busy }} disabled={busy} onPress={() => updatePreferences({ temaEscuro: darkMode, avatarId: item.id })} style={s.avatarChoice}><NativeText style={s.avatarChoiceSymbol}>{item.symbol}</NativeText></Pressable>)}</View>
      {busy ? <ActivityIndicator accessibilityLabel="Salvando avatar" color={theme.colors.primary} /> : null}
      <Text style={s.muted}>O sistema armazena somente o número do avatar. Raça e etnia não são coletadas.</Text>
    </Card><EducationalBanner message={educationalMessages[bannerIndex]} />
  </ScrollView></SafeAreaView>);
  return themed(<SafeAreaView style={s.screen}><StatusBar style={darkMode ? 'light' : 'dark'} /><View style={s.header}><View style={s.brandRow}><Image source={require('./assets/techpaper-symbol-v4.png')} style={s.logoSmall} accessibilityLabel="Símbolo TechPaper" /><Text style={s.brand}>TechPaper</Text></View><View style={s.userHeader}><Avatar id={session.user.avatarId} size="small" /><Text style={s.muted}>{session.user.name}</Text></View></View>
    <View style={s.sync}><Text style={s.muted}>{lastSync ? `Atualizado ${lastSync.toLocaleTimeString('pt-BR')}` : 'Aguardando sincronização'}</Text><Pressable accessibilityLabel="Atualizar dados do sistema" accessibilityHint="Busca novamente produtos, movimentações, orçamentos e preferências" accessibilityRole="button" onPress={() => sync()} disabled={refreshing || busy} style={s.refresh}><Text style={s.link}>{refreshing ? 'Atualizando…' : 'Atualizar'}</Text></Pressable></View>
    {notice ? <Text accessibilityRole="alert" style={s.notice}>{notice}</Text> : null}
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl accessibilityLabel="Puxe para atualizar o estoque" refreshing={refreshing} onRefresh={() => sync()} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}>
      <Text accessibilityRole="header" style={s.title}>{detail ? `Orçamento #${detail.id}` : tab}</Text>
      {detail ? <Card><Text style={s.subtitle}>{detail.cliente}</Text><Text>{detail.status} · Válido até {detail.validade.slice(0, 10)}</Text>
        {detail.itens.map(i => <Text key={i.id} style={s.row}>{i.quantidade} × {i.produtoNome} — {money(i.subtotal)}</Text>)}<Text style={s.subtitle}>{money(detail.total)}</Text>
        <Text style={s.muted}>Orçamentos não reservam nem baixam estoque.</Text>
        {canApprove && detail.status === 'Rascunho' && ['Aprovado', 'Cancelado'].map(status => <Button key={status} title={status === 'Aprovado' ? 'Aprovar orçamento' : 'Cancelar orçamento'} secondary={status === 'Cancelado'} disabled={busy} onPress={() => run(async () => { const updated = await api(session)(`orcamentos/${detail.id}/status`, { method: 'PATCH', body: { status, versao: detail.versao } }); setDetail({ ...detail, ...updated, itens: detail.itens }); await sync(); })} />)}
        <Button title="Voltar à lista" secondary onPress={() => setDetail(null)} /></Card> : <>
      {tab === 'Resumo' && <><Text style={s.muted}>Uma visão do que precisa de atenção.</Text><Card><Text style={s.metric}>{data.produtos.length}</Text><Text>Produtos cadastrados</Text></Card><Card><Text style={s.metric}>{data.produtos.filter(p => p.estoque < 20).length}</Text><Text>Produtos com estoque abaixo de 20</Text></Card><Card><Text style={s.metric}>{data.orcamentos.filter(o => o.status === 'Rascunho').length}</Text><Text>Orçamentos em rascunho</Text></Card><DashboardCharts produtos={data.produtos} movimentacoes={data.movimentacoes} />{pending && <Button title="Concluir movimentação pendente" onPress={() => setTab('Estoque')} />}</>}
      {tab === 'Produtos' && <><Field label="Buscar por nome ou SKU" value={search} onChangeText={setSearch} />{filtered.map(p => <Card key={p.id}><Text style={s.subtitle}>{p.nome}</Text><Text style={s.muted}>{p.sku} · {p.categoria}</Text><Text style={s.row}>{money(p.precoVenda)} · {p.estoque} unidades</Text><Text style={s.muted}>{p.fornecedor}</Text></Card>)}{!filtered.length && <Text>Nenhum produto encontrado.</Text>}</>}
      {tab === 'Estoque' && <>
        <Card><Text style={s.subtitle}>Registrar movimentação</Text>
          {pending ? <><Text style={s.notice}>Uma operação aguarda confirmação. A nova tentativa usa a mesma identificação para evitar duplicidade.</Text><Text>{pending.tipo} · {pending.quantidade} unidade(s) · Produto #{pending.produtoId}</Text></> : <>{picker}<View style={s.actions}>{['Entrada', 'Saida'].map(t => <Button key={t} title={`${tipo === t ? '✓ ' : ''}${t === 'Saida' ? 'Saída' : t}`} secondary={tipo !== t} onPress={() => setTipo(t)} />)}</View><Field label="Quantidade" value={quantidade} onChangeText={setQuantidade} keyboardType="number-pad" /><Field label="Motivo" value={motivo} onChangeText={setMotivo} maxLength={100} /></>}
          <Button title={busy ? 'Confirmando…' : pending ? 'Tentar confirmar novamente' : 'Confirmar movimentação'} onPress={move} disabled={busy || refreshing} />
        </Card><Text style={s.subtitle}>Últimas movimentações</Text>{data.movimentacoes.slice(0, 30).map(m => <Card key={m.id}><Text style={s.label}>{m.tipo === 'Saida' ? 'Saída' : 'Entrada'} · {m.quantidade} × {m.produtoNome}</Text><Text>{m.motivo}</Text><Text style={s.muted}>{m.responsavel} · {formatDateTime(m.dataHora)}</Text></Card>)}
      </>}
      {tab === 'Orçamentos' && <>
        <Card><Text style={s.subtitle}>Novo orçamento</Text><Field label="Cliente" value={cliente} onChangeText={setCliente} maxLength={150} /><Field label="Validade (AAAA-MM-DD)" value={validade} onChangeText={setValidade} maxLength={10} />{picker}
          <Field label="Quantidade do item" value={quantidade} onChangeText={setQuantidade} keyboardType="number-pad" /><Button title="Adicionar item" secondary disabled={!selected || busy} onPress={() => { try { setCart(addItem(cart, selected, positiveInteger(quantidade))); } catch (e) { setNotice(e.message); } }} />
          {cart.map(i => <View key={i.produtoId} style={s.row}><Text>{i.quantidade} × {data.produtos.find(p => p.id === i.produtoId)?.nome}</Text><Button title="Remover item" secondary onPress={() => setCart(cart.filter(x => x.produtoId !== i.produtoId))} /></View>)}
          <Text style={s.muted}>O servidor confirma os preços e o total ao salvar.</Text><Button title="Salvar orçamento" disabled={busy || !cart.length} onPress={saveQuote} />
        </Card><Text style={s.subtitle}>Orçamentos da equipe</Text>{data.orcamentos.map(o => <Card key={o.id}><Text style={s.label}>#{o.id} · {o.cliente}</Text><Text>{o.status} · {money(o.total)}</Text><Button title="Ver detalhes" secondary onPress={() => setDetail(o)} /></Card>)}
      </>}
      {tab === 'Conta' && <><Card><View style={s.profile}><Avatar id={session.user.avatarId} /><View><Text style={s.subtitle}>{session.user.name}</Text><Text>{session.user.login}</Text><Text style={s.row}>Perfil: {session.user.role}</Text></View></View><Text style={s.label}>Escolha seu avatar</Text><View accessibilityRole="radiogroup" accessibilityLabel="Galeria de avatares" style={s.avatarGallery}>{avatars.map(item => <Pressable key={item.id} accessibilityLabel={item.label} accessibilityRole="radio" accessibilityState={{ checked: session.user.avatarId === item.id, disabled: busy }} disabled={busy} onPress={() => updatePreferences({ temaEscuro: darkMode, avatarId: item.id })} style={[s.avatarChoice, session.user.avatarId === item.id && s.avatarChoiceSelected]}><NativeText style={s.avatarChoiceSymbol}>{item.symbol}</NativeText></Pressable>)}</View><Button title={darkMode ? 'Usar tema claro' : 'Usar tema escuro'} accessibilityLabel={darkMode ? 'Ativar tema claro' : 'Ativar tema escuro'} disabled={busy} onPress={() => updatePreferences({ temaEscuro: !darkMode, avatarId: session.user.avatarId })} /><Text style={s.muted}>Tema e avatar ficam associados à sua conta e são sincronizados pelo servidor.</Text><Button title="Sair da conta" secondary disabled={busy} onPress={logout} /></Card><Card><Text style={s.subtitle}>Uma ferramenta para toda a equipe</Text><Text style={s.row}>Atendimento respeitoso e igualdade de acesso fazem parte do TechPaper. O avatar é uma representação escolhida pelo usuário; o sistema não registra raça, religião ou outros dados sensíveis.</Text><Text>Use os recursos de tamanho de fonte e leitor de tela do seu aparelho. Relate barreiras de uso ao responsável da equipe.</Text></Card></>}
      <EducationalBanner message={educationalMessages[bannerIndex]} />
      </>}
    </ScrollView></KeyboardAvoidingView>
    <View accessibilityRole="tablist" style={s.tabs}>{tabs.map(t => <Pressable key={t} accessibilityLabel={`Abrir ${t}`} accessibilityRole="tab" accessibilityState={{ selected: tab === t }} style={[s.tab, tab === t && s.activeTab]} onPress={() => { setTab(t); setDetail(null); }}><Text style={[s.tabText, tab === t && s.activeTabText]}>{t}</Text></Pressable>)}</View>
  </SafeAreaView>);
}
/*
 * A fábrica de tema centraliza cores e contraste. A preferência vem da API,
 * portanto o mesmo usuário obtém a mesma apresentação no web e no mobile.
 */
function createTheme(dark) {
  const colors = dark
    ? { background: '#0B1822', surface: '#142633', text: '#F5F8FA', muted: '#B8C8D3', primary: '#62B8E6', secondary: '#203C4E', border: '#365365', input: '#10212D', notice: '#4B3514', noticeText: '#FFE3A7' }
    : { background: '#F1F5F9', surface: '#FFFFFF', text: '#123047', muted: '#465C6C', primary: '#13577C', secondary: '#E6EFF5', border: '#DCE5EC', input: '#FFFFFF', notice: '#FFF0D5', noticeText: '#694000' };
  const s = StyleSheet.create({
    flex: { flex: 1 },
    text: { color: colors.text },
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, gap: 16, paddingBottom: 36 },
    onboardingContent: { flexGrow: 1, justifyContent: 'center', padding: 20, gap: 18 },
    header: { paddingHorizontal: 20, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    userHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoFull: { width: 230, height: 210, alignSelf: 'center', borderRadius: 18 },
    logoSmall: { width: 38, height: 38 },
    brand: { fontSize: 20, fontWeight: '900', color: colors.primary, letterSpacing: .5 },
    title: { fontSize: 30, fontWeight: '800', color: colors.text, marginTop: 12 },
    subtitle: { fontSize: 21, fontWeight: '700', color: colors.text, marginBottom: 8 },
    muted: { fontSize: 14, color: colors.muted, lineHeight: 21 },
    card: { backgroundColor: colors.surface, borderRadius: 18, padding: 20, gap: 12, borderWidth: 1, borderColor: colors.border },
    field: { gap: 6, marginBottom: 8 },
    label: { fontSize: 16, fontWeight: '600', color: colors.text },
    input: { borderWidth: 1, borderColor: colors.muted, padding: 13, minHeight: 48, borderRadius: 9, fontSize: 17, color: colors.text, backgroundColor: colors.input },
    button: { backgroundColor: colors.primary, minHeight: 48, justifyContent: 'center', alignItems: 'center', padding: 13, borderRadius: 10, marginTop: 6 },
    buttonText: { color: dark ? '#08141C' : '#FFFFFF', fontWeight: '700', fontSize: 16 },
    secondary: { backgroundColor: colors.secondary },
    secondaryText: { color: colors.text },
    disabled: { opacity: .55 },
    notice: { backgroundColor: colors.notice, color: colors.noticeText, padding: 14, fontSize: 15, lineHeight: 22 },
    metric: { fontSize: 38, fontWeight: '800', color: colors.primary },
    row: { paddingVertical: 8, fontSize: 16 },
    sync: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    refresh: { minHeight: 44, justifyContent: 'center', paddingLeft: 10 },
    link: { color: colors.primary, fontWeight: '700' },
    product: { padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 9, marginBottom: 6, minHeight: 48 },
    selected: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.secondary },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    profile: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    avatar: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondary },
    avatarSmall: { width: 38, height: 38, borderRadius: 19 },
    avatarSymbol: { fontSize: 34 },
    avatarSymbolSmall: { fontSize: 22 },
    avatarGallery: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    avatarChoice: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border, backgroundColor: colors.input },
    avatarChoiceSelected: { borderColor: colors.primary, backgroundColor: colors.secondary },
    avatarChoiceSymbol: { fontSize: 30 },
    donutLayout: { alignItems: 'center', gap: 18, paddingVertical: 8 },
    legend: { width: '100%', gap: 8 },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
    legendDot: { width: 12, height: 12, borderRadius: 4 },
    legendText: { flex: 1, fontSize: 14 },
    legendValue: { fontWeight: '800' },
    barChart: { gap: 20, paddingVertical: 8 },
    barRow: { gap: 8 },
    barLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    barTrack: { height: 25, overflow: 'hidden', borderRadius: 8, backgroundColor: colors.secondary },
    barFill: { height: '100%', minWidth: 3, borderRadius: 8 },
    educationalBanner: { backgroundColor: dark ? '#243E4C' : '#E8F4F8', borderLeftWidth: 5, borderLeftColor: colors.primary, borderRadius: 12, padding: 18, gap: 6 },
    bannerTitle: { fontSize: 16, fontWeight: '800', color: colors.primary },
    bannerText: { fontSize: 15, lineHeight: 22 },
    tabs: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: colors.surface, padding: 6, borderTopWidth: 1, borderTopColor: colors.border },
    tab: { flexGrow: 1, minHeight: 50, padding: 9, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
    activeTab: { backgroundColor: colors.secondary },
    tabText: { fontSize: 12, color: colors.muted },
    activeTabText: { color: colors.text, fontWeight: '800' },
  });
  return { colors, s };
}
