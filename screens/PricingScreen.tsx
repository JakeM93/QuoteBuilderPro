import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import styles from '../styles/styles';
import { PricingProfile } from '../types';

interface PricingScreenProps {
  pricingProfiles: PricingProfile[];
  setPricingProfiles: React.Dispatch<React.SetStateAction<PricingProfile[]>>;
  addPricingProfile: () => void;
  createPricingItem: (category: string) => void;
  updateCatalogueItem: (
    profileId: string,
    category: string,
    itemId: string,
    patch: Partial<{ name: string; labour: number; materials: number }>
  ) => void;
}

export default function PricingScreen({
  pricingProfiles,
  setPricingProfiles,
  addPricingProfile,
  createPricingItem,
  updateCatalogueItem,
}: PricingScreenProps) {
  return (
    <Card title="Pricing Profiles">
      <Button text="Add Pricing Profile" onPress={addPricingProfile} />
      {pricingProfiles.map((profile) => (
        <View key={profile.id} style={styles.itemCard}>
          <Label text="Profile Name" />
          <Input
            value={profile.name}
            onChangeText={(v) =>
              setPricingProfiles((prev) =>
                prev.map((p) => (p.id === profile.id ? { ...p, name: v } : p))
              )
            }
          />

          <Label text="Internal Margin %" />
          <Input
            value={String(profile.marginPct)}
            keyboardType="numeric"
            onChangeText={(v) =>
              setPricingProfiles((prev) =>
                prev.map((p) =>
                  p.id === profile.id ? { ...p, marginPct: Number(v) || 0 } : p
                )
              )
            }
          />

          <Label text="VAT Rate" />
          <Input
            value={String(profile.vatRate)}
            keyboardType="numeric"
            onChangeText={(v) =>
              setPricingProfiles((prev) =>
                prev.map((p) =>
                  p.id === profile.id ? { ...p, vatRate: Number(v) || 0 } : p
                )
              )
            }
          />

          <Label text="Complexity Multipliers" />
          {Object.entries(profile.complexityMultipliers).map(([key, value]) => (
            <View key={key} style={styles.inlineField}>
              <Text style={styles.inlineLabel}>{key}</Text>
              <TextInput
                style={styles.inlineInput}
                value={String(value)}
                keyboardType="numeric"
                onChangeText={(v) =>
                  setPricingProfiles((prev) =>
                    prev.map((p) =>
                      p.id === profile.id
                        ? {
                            ...p,
                            complexityMultipliers: {
                              ...p.complexityMultipliers,
                              [key]: Number(v) || 0,
                            },
                          }
                        : p
                    )
                  )
                }
              />
            </View>
          ))}

          <Label text="Specification Multipliers" />
          {Object.entries(profile.specMultipliers).map(([key, value]) => (
            <View key={key} style={styles.inlineField}>
              <Text style={styles.inlineLabel}>{key}</Text>
              <TextInput
                style={styles.inlineInput}
                value={String(value)}
                keyboardType="numeric"
                onChangeText={(v) =>
                  setPricingProfiles((prev) =>
                    prev.map((p) =>
                      p.id === profile.id
                        ? {
                            ...p,
                            specMultipliers: {
                              ...p.specMultipliers,
                              [key]: Number(v) || 0,
                            },
                          }
                        : p
                    )
                  )
                }
              />
            </View>
          ))}

          {Object.keys(profile.catalogue).map((category) => (
            <View key={category} style={{ marginTop: 8 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.groupTitle}>{category}</Text>
                <TouchableOpacity
                  style={styles.smallAction}
                  onPress={() => createPricingItem(category)}
                >
                  <Text style={styles.smallActionText}>Add Item</Text>
                </TouchableOpacity>
              </View>

              {profile.catalogue[category].map((item) => (
                <View key={item.id} style={styles.itemCardSoft}>
                  <Label text="Item Name" />
                  <Input
                    value={item.name}
                    onChangeText={(v) =>
                      updateCatalogueItem(profile.id, category, item.id, { name: v })
                    }
                  />

                  <Label text="Labour" />
                  <Input
                    value={String(item.labour)}
                    keyboardType="numeric"
                    onChangeText={(v) =>
                      updateCatalogueItem(profile.id, category, item.id, {
                        labour: Number(v) || 0,
                      })
                    }
                  />

                  <Label text="Materials" />
                  <Input
                    value={String(item.materials)}
                    keyboardType="numeric"
                    onChangeText={(v) =>
                      updateCatalogueItem(profile.id, category, item.id, {
                        materials: Number(v) || 0,
                      })
                    }
                  />
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
    </Card>
  );
}
