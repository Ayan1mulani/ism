// app/ServiceRequestScreen/components/ServiceRequestDetail.js
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '../../../Utils/ConetextApi';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  primary: '#1996D3',
  success: '#22C55E',
  warning: '#F59E0B',
  danger:  '#EF4444',
  info:    '#6366F1',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusCfg = (status, nightMode) => {
  const s = (status || '').toLowerCase();
  if (['closed', 'resolved', 'completed'].includes(s))
    return { label: 'Closed',      color: C.success, bg: nightMode ? '#052E16' : '#DCFCE7', icon: 'checkmark-circle' };
  if (['open', 'pending'].includes(s))
    return { label: 'Open',        color: C.warning, bg: nightMode ? '#2D1B00' : '#FEF3C7', icon: 'time' };
  if (s === 'in progress')
    return { label: 'In Progress', color: C.primary, bg: nightMode ? '#0C2340' : '#DBEAFE', icon: 'sync' };
  return   { label: status || '—', color: C.info,    bg: nightMode ? '#1E1B40' : '#EEF2FF', icon: 'ellipse' };
};

const fmt = (d) => {
  if (!d || d.startsWith('0000')) return '—';
  try {
    return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return d; }
};

const ago = (d) => {
  try {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000), h = Math.floor(m / 60), day = Math.floor(h / 24);
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (day < 30) return `${day}d ago`;
    return `${Math.floor(day / 30)}mo ago`;
  } catch { return ''; }
};

const parseActivity = (data) => {
  try {
    const p = JSON.parse(data || '{}');
    if (p.status_history) return p.status_history.map((i, idx) => ({ id: idx, title: `→ ${i.status}`, time: i.timestamp, color: C.primary }));
    if (p.escalations)    return p.escalations.map((i, idx) => ({ id: idx, title: `Escalated L${i.level}${i.name ? ' · ' + i.name : ''}`, time: i.time, color: C.danger }));
  } catch { /**/ }
  return [];
};

// ─── Tiny reusable row ────────────────────────────────────────────────────────
const Row = ({ icon, label, value, theme, color }) => {
  if (!value && value !== 0) return null;
  return (
    <View style={r.row}>
      <Ionicons name={icon} size={13} color={color || theme.muted} style={r.icon} />
      <Text style={[r.label, { color: theme.muted }]}>{label}</Text>
      <Text style={[r.value, { color: color || theme.text }]} numberOfLines={1}>{String(value)}</Text>
    </View>
  );
};
const r = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  icon:  { marginRight: 6, width: 14 },
  label: { fontSize: 11, width: 90, flexShrink: 0 },
  value: { fontSize: 12, fontWeight: '600', flex: 1 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
const ServiceRequestDetailScreen = () => {
  const { nightMode } = usePermissions();
  const route         = useRoute();
  const navigation    = useNavigation();

  const t = nightMode ? {
    bg: '#0F0F14', surface: '#18181F', text: '#F1F5F9',
    sub: '#94A3B8', muted: '#475569', border: '#1E2030', divider: '#1A1A24',
  } : {
    bg: '#F0F4F8', surface: '#FFFFFF', text: '#0F172A',
    sub: '#475569', muted: '#94A3B8', border: '#E2E8F0', divider: '#F1F5F9',
  };

  const c          = route.params?.complaint || {};
  const sc         = statusCfg(c.status, nightMode);
  const isClosed   = ['closed', 'resolved', 'completed'].includes((c.status || '').toLowerCase());
  const catLabel   = c.sub_category || c.complaint_type_name || 'Service Request';
  const activities = parseActivity(c.data);
  const rating     = parseFloat(c.rating);

  return (
    <SafeAreaView style={[s.root, { backgroundColor: t.bg }]} edges={['top']}>

      {/* ── Top bar ── */}
      <View style={[s.topBar, { backgroundColor: t.surface, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={t.text} />
        </TouchableOpacity>
        <Text style={[s.topId, { color: C.primary }]}>#{c.com_no || c.id || '—'}</Text>
        <View style={{ flex: 1 }} />
        {!!c.esc_level && (
          <View style={s.escTag}>
            <Ionicons name="warning" size={10} color={C.danger} />
            <Text style={s.escText}>ESC</Text>
          </View>
        )}
        <View style={[s.pill, { backgroundColor: sc.bg }]}>
          <Ionicons name={sc.icon} size={10} color={sc.color} style={{ marginRight: 3 }} />
          <Text style={[s.pillTxt, { color: sc.color }]}>{sc.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Main card ── */}
        <View style={[s.card, { backgroundColor: t.surface, borderColor: t.border }]}>

          {/* Category + severity inline */}
          <View style={s.catRow}>
            <Text style={[s.catText, { color: C.primary }]} numberOfLines={1}>{catLabel}</Text>
            {!!c.severity && (
              <Text style={[s.sevBadge, {
                color: c.severity.toLowerCase() === 'high' ? C.danger : C.success,
                backgroundColor: c.severity.toLowerCase() === 'high' ? '#FEE2E2' : '#DCFCE7',
              }]}>{c.severity}</Text>
            )}
          </View>

          {/* Description */}
          <Text style={[s.desc, { color: t.sub }]} numberOfLines={3}>
            {c.description || 'No description provided.'}
          </Text>

          {/* Escalation inline warning */}
          {!!c.esc_level && (
            <View style={s.escBanner}>
              <Ionicons name="warning-outline" size={12} color={C.danger} />
              <Text style={s.escBannerText}>Escalated to level {c.esc_level}</Text>
            </View>
          )}

          <View style={[s.divider, { backgroundColor: t.divider }]} />

          {/* Info rows — compact single-line key:value */}
          <Row icon="location-outline"   label="Flat / Unit"    value={c.flat_no}        theme={t} color={C.primary} />
          <Row icon="business-outline"   label="Block"          value={c.block}           theme={t} />
          <Row icon="person-outline"     label="Assigned"       value={c.staff_name}      theme={t} color={C.info} />
          <Row icon="person-add-outline" label="Created By"     value={c.createdBy}       theme={t} />
          <Row icon="pencil-outline"     label="Updated By"     value={c.updatedBy}       theme={t} />
          <Row icon="time-outline"       label="Sched. Time"    value={c.probable_time}   theme={t} color={C.info} />
          <Row icon="chatbubble-outline" label="Comments"       value={c.comment_count}   theme={t} />

          {!!c.resident_remarks && (
            <>
              <View style={[s.divider, { backgroundColor: t.divider }]} />
              <Text style={[s.remarksLabel, { color: t.muted }]}>Resident Remarks</Text>
              <Text style={[s.remarks, { color: t.sub }]}>{c.resident_remarks}</Text>
            </>
          )}
        </View>

        {/* ── Timeline card ── */}
        <View style={[s.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Text style={[s.secTitle, { color: t.muted }]}>TIMELINE</Text>

          {[
            { dot: C.primary, label: 'Created', date: c.created_at },
            { dot: t.muted,   label: 'Updated', date: c.updated_at },
            isClosed && { dot: C.success, label: 'Closed', date: c.closed_at },
          ].filter(Boolean).map((row, i) => (
            <View key={i} style={s.tlRow}>
              <View style={[s.tlDot, { backgroundColor: row.dot }]} />
              <Text style={[s.tlLabel, { color: t.muted }]}>{row.label}</Text>
              <Text style={[s.tlDate, { color: t.text }]}>{fmt(row.date)}</Text>
              <Text style={[s.tlAgo, { color: t.muted }]}>{ago(row.date)}</Text>
            </View>
          ))}

          {activities.length > 0 && (
            <>
              <View style={[s.divider, { backgroundColor: t.divider, marginVertical: 8 }]} />
              {activities.map((a) => (
                <View key={a.id} style={s.tlRow}>
                  <View style={[s.tlDot, { backgroundColor: a.color }]} />
                  <Text style={[s.tlLabel, { color: t.muted }]}>Event</Text>
                  <Text style={[s.tlDate, { color: t.text, flex: 1 }]} numberOfLines={1}>{a.title}</Text>
                  <Text style={[s.tlAgo, { color: t.muted }]}>{ago(a.time)}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* ── Rating (compact) ── */}
        {isClosed && !isNaN(rating) && rating > 0 && (
          <View style={[s.card, s.ratingCard, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Text style={[s.secTitle, { color: t.muted }]}>RATING</Text>
            <View style={s.starsRow}>
              {[1,2,3,4,5].map((st) => (
                <Ionicons key={st} name={st <= Math.round(rating) ? 'star' : 'star-outline'} size={20} color={C.warning} />
              ))}
              <Text style={[s.ratingNum, { color: t.text }]}>{rating.toFixed(1)}</Text>
            </View>
          </View>
        )}

        {/* ── Action button ── */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[s.actionBtn, { backgroundColor: isClosed ? C.warning : C.success }]}
        >
          <Ionicons name={isClosed ? 'refresh-circle-outline' : 'checkmark-circle-outline'} size={16} color="#fff" />
          <Text style={s.actionTxt}>{isClosed ? 'Re-open Complaint' : 'Mark as Resolved'}</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },

  // Top bar — minimal height
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    gap: 8,
  },
  back: { padding: 4 },
  topId: { fontSize: 14, fontWeight: '800' },
  pill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  pillTxt: { fontSize: 10, fontWeight: '700' },
  escTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FEE2E2', paddingHorizontal: 6,
    paddingVertical: 3, borderRadius: 6,
  },
  escText: { fontSize: 9, fontWeight: '800', color: C.danger },

  // Scroll
  scroll: { padding: 10, gap: 8 },

  // Card
  card: {
    borderRadius: 12, padding: 19, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },

  // Category row
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  catText: { fontSize: 14, fontWeight: '700', flex: 1 },
  sevBadge: { fontSize: 10, fontWeight: '700', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },

  // Description
  desc: { fontSize: 12, lineHeight: 18, marginBottom: 8 },

  // Escalation banner
  escBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FEE2E2', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 5, marginBottom: 8,
  },
  escBannerText: { fontSize: 12, fontWeight: '600', color: C.danger },

  // Divider
  divider: { height: 1, marginVertical: 10 },

  // Remarks
  remarksLabel: { fontSize: 16, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 },
  remarks: { fontSize: 17, lineHeight: 18 },

  // Section title
  secTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },

  // Timeline rows — single line
  tlRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  tlDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  tlLabel: { fontSize: 12, width: 46, flexShrink: 0 },
  tlDate: { fontSize: 11, fontWeight: '500', flex: 1 },
  tlAgo: { fontSize: 10 },

  // Rating
  ratingCard: { paddingVertical: 10 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingNum: { fontSize: 16, fontWeight: '800', marginLeft: 8 },

  // Action
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 12,
  },
  actionTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
});

export default ServiceRequestDetailScreen;