import { TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
export default function SearchBar({ value, onChangeText, onFocus, icon, color, iconPress }) {
  //  const contacts = useSelector((state) => state.contacts.list)
  //  console.log(contacts)
  // console.log("i am in search bar")
  return (
    <View className="flex-row h-[50px] w-full items-center bg-[#333e4a] overflow-hidden rounded-full px-5 my-2">
      {/* Search Icon */}
      <TouchableOpacity onPress={iconPress ? iconPress : () => console.log("Icon pressed!")}>
        <Icon name={icon} size={18} color={color} />
      </TouchableOpacity>

      {/* Input */}
      <TextInput
        placeholder="Ask meta Ai or Search"
        placeholderTextColor="#8696A0"
        className="flex-1 ml-3 text-xl w-full text-white"
        onFocus={onFocus}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}
