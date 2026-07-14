/**
 * ЧБ-стиль Google Maps под арт-направление «досье»: карта обесцвечена,
 * чтобы цветные маркеры направлений, золотой маркер и «красная нитка»
 * читались как улики на доске. Подключается в Фазе 1:
 * <MapView customMapStyle={grayscaleMapStyle} />.
 */
export const grayscaleMapStyle = [
  { elementType: 'geometry', stylers: [{ saturation: -100 }] },
  { elementType: 'labels.text.fill', stylers: [{ saturation: -100 }, { lightness: 10 }] },
  { elementType: 'labels.text.stroke', stylers: [{ saturation: -100 }] },
  { elementType: 'labels.icon', stylers: [{ saturation: -100 }] },
  { featureType: 'water', stylers: [{ saturation: -100 }, { lightness: 30 }] },
  { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels.icon', stylers: [{ saturation: -100 }] },
];
