import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/Card';
import { Input } from '../../../components/Input';
import { colors, typography, spacing, radius } from '../../../theme';
import { RestaurantOnboardingData } from '../RestaurantOnboardingScreen';
import * as Haptics from 'expo-haptics';
// import * as ImagePicker from 'expo-image-picker'; // Install: npx expo install expo-image-picker

interface OnboardingStep2Props {
  data: RestaurantOnboardingData;
  updateData: (updates: Partial<RestaurantOnboardingData>) => void;
}

export const OnboardingStep2: React.FC<OnboardingStep2Props> = ({ data, updateData }) => {
  const [newSpeciality, setNewSpeciality] = useState('');
  const [newOffer, setNewOffer] = useState('');

  const handlePickImage = async (type: 'menu' | 'ambience') => {
    // TODO: Install expo-image-picker: npx expo install expo-image-picker
    Alert.alert(
      'Image Upload',
      `Image upload for ${type} will be available after installing expo-image-picker. For now, you can add images later in settings.`,
      [{ text: 'OK' }]
    );
    
    // Uncomment when expo-image-picker is installed:
    // try {
    //   const result = await ImagePicker.launchImageLibraryAsync({
    //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //     allowsMultipleSelection: true,
    //     quality: 0.8,
    //   });
    //
    //   if (!result.canceled && result.assets) {
    //     const imageUris = result.assets.map((asset) => asset.uri);
    //     if (type === 'menu') {
    //       updateData({ menuImages: [...data.menuImages, ...imageUris] });
    //     } else {
    //       updateData({ ambienceImages: [...data.ambienceImages, ...imageUris] });
    //     }
    //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    //   }
    // } catch (err) {
    //   Alert.alert('Error', 'Failed to pick image');
    // }
  };

  const handleRemoveImage = (type: 'menu' | 'ambience', index: number) => {
    if (type === 'menu') {
      const newImages = data.menuImages.filter((_, i) => i !== index);
      updateData({ menuImages: newImages });
    } else {
      const newImages = data.ambienceImages.filter((_, i) => i !== index);
      updateData({ ambienceImages: newImages });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddSpeciality = () => {
    if (newSpeciality.trim()) {
      updateData({ specialities: [...data.specialities, newSpeciality.trim()] });
      setNewSpeciality('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveSpeciality = (index: number) => {
    const newSpecialities = data.specialities.filter((_, i) => i !== index);
    updateData({ specialities: newSpecialities });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddOffer = () => {
    if (newOffer.trim()) {
      updateData({ offers: [...data.offers, newOffer.trim()] });
      setNewOffer('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveOffer = (index: number) => {
    const newOffers = data.offers.filter((_, i) => i !== index);
    updateData({ offers: newOffers });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View>
      <Text style={styles.description}>
        Showcase your restaurant with images and highlight what makes you special
      </Text>

      {/* Menu Images */}
      <Card style={styles.card}>
        <Text style={styles.sectionLabel}>Menu Images (Optional)</Text>
        <TouchableOpacity
          style={styles.imagePickerButton}
          onPress={() => handlePickImage('menu')}
        >
          <Ionicons name="camera-outline" size={24} color={colors.primary.main} />
          <Text style={styles.imagePickerText}>Add Menu Images</Text>
        </TouchableOpacity>
        {data.menuImages.length > 0 && (
          <View style={styles.imageGrid}>
            {data.menuImages.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage('menu', index)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.status.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Ambience Images */}
      <Card style={styles.card}>
        <Text style={styles.sectionLabel}>Ambience Images (Optional)</Text>
        <TouchableOpacity
          style={styles.imagePickerButton}
          onPress={() => handlePickImage('ambience')}
        >
          <Ionicons name="images-outline" size={24} color={colors.primary.main} />
          <Text style={styles.imagePickerText}>Add Ambience Images</Text>
        </TouchableOpacity>
        {data.ambienceImages.length > 0 && (
          <View style={styles.imageGrid}>
            {data.ambienceImages.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage('ambience', index)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.status.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Specialities */}
      <Card style={styles.card}>
        <Text style={styles.sectionLabel}>Specialities (Optional)</Text>
        <Text style={styles.helperText}>
          What makes your restaurant unique? (e.g., "Farm-to-table", "Live music", "Rooftop dining")
        </Text>
        <View style={styles.addItemRow}>
          <Input
            placeholder="Add a speciality"
            value={newSpeciality}
            onChangeText={setNewSpeciality}
            containerStyle={styles.addItemInput}
            leftIcon="star-outline"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddSpeciality}
          >
            <Ionicons name="add-circle" size={32} color={colors.primary.main} />
          </TouchableOpacity>
        </View>
        {data.specialities.length > 0 && (
          <View style={styles.chipsContainer}>
            {data.specialities.map((item, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
                <TouchableOpacity onPress={() => handleRemoveSpeciality(index)}>
                  <Ionicons name="close" size={16} color={colors.text.muted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Offers */}
      <Card style={styles.card}>
        <Text style={styles.sectionLabel}>Offers & Promotions (Optional)</Text>
        <Text style={styles.helperText}>
          Current promotions or special offers (e.g., "Happy Hour 5-7pm", "Weekend Brunch Special")
        </Text>
        <View style={styles.addItemRow}>
          <Input
            placeholder="Add an offer"
            value={newOffer}
            onChangeText={setNewOffer}
            containerStyle={styles.addItemInput}
            leftIcon="pricetag-outline"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddOffer}
          >
            <Ionicons name="add-circle" size={32} color={colors.primary.main} />
          </TouchableOpacity>
        </View>
        {data.offers.length > 0 && (
          <View style={styles.chipsContainer}>
            {data.offers.map((item, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{item}</Text>
                <TouchableOpacity onPress={() => handleRemoveOffer(index)}>
                  <Ionicons name="close" size={16} color={colors.text.muted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  description: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  helperText: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.elegant,
    borderStyle: 'dashed',
    marginBottom: spacing.md,
  },
  imagePickerText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: radius.full,
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  addItemInput: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    padding: spacing.xs,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
});
