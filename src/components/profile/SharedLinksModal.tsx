import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { styles } from './ProfileModals.styles';

export interface SharedLinksModalProps {
  visible: boolean;
  username: string;
  onClose: () => void;
}

export const SharedLinksModal: React.FC<SharedLinksModalProps> = ({
  visible,
  username,
  onClose,
}) => {
  const [isLinkEnabled, setIsLinkEnabled] = useState(true);
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://cnufree.app/u/${username || 'bernadette_c'}`;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2400);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          <View style={styles.dragHandleBar} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity style={styles.sheetCloseButton} onPress={onClose}>
                <Text style={styles.sheetCloseButtonText}>Done</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetTitle}>Shared Links</Text>
            <Text style={styles.sheetSubtitle}>
              Share your personal live calendar link with classmates, project groups, or club members.
            </Text>

            {/* Link Switch Toggle */}
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsLinkEnabled(!isLinkEnabled)}
              activeOpacity={0.8}
            >
              <Text style={styles.toggleLabel}>Allow sharing via link</Text>
              <View
                style={[
                  styles.switchPill,
                  !isLinkEnabled && styles.switchPillOff,
                ]}
              >
                <View
                  style={[
                    styles.switchThumb,
                    !isLinkEnabled && styles.switchThumbOff,
                  ]}
                />
              </View>
            </TouchableOpacity>

            {/* Link display card */}
            {isLinkEnabled && (
              <View style={styles.linkDisplayCard}>
                <Text style={styles.linkText} numberOfLines={1}>
                  {shareUrl}
                </Text>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={handleCopy}
                  activeOpacity={0.8}
                >
                  <Text style={styles.copyBtnText}>
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!isLinkEnabled && (
              <View
                style={[
                  styles.feedbackBanner,
                  { backgroundColor: 'rgba(21, 31, 23, 0.25)' },
                ]}
              >
                <Text style={styles.feedbackText}>
                  Link sharing is currently disabled. Anyone with the URL will not see your schedule.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
