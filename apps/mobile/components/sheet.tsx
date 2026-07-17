// Bottom sheet built on the RN Modal — slides up, tap the overlay to dismiss.
// One soft shadow is allowed on floating layers (Quiet Garden depth rule).
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import type { ReactNode } from 'react'
import { fonts } from '../lib/theme'
import { useTheme } from '../lib/use-theme'

interface Props {
  visible: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Sheet({ visible, onClose, title, children }: Props) {
  const { theme } = useTheme()
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrap}
      >
        <Pressable style={[styles.overlay, { backgroundColor: theme.modalOverlay }]} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: theme.bgCard }]}>
          <View style={[styles.grabber, { backgroundColor: theme.bgHover }]} />
          {title ? <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text> : null}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#0a0f0a',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 16,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    marginBottom: 16,
  },
})
