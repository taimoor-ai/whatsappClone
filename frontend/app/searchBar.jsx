import { useRouter } from "expo-router";
import { View } from "react-native";
import SearchBar from "../components/SearchBar";
export default function Index() {
  const router = useRouter()
  return (
    <View
     className="flex-1 bg-[#111b26] px-4 pt-10"
    >
      <SearchBar iconPress={()=>{router.push('/Chats')}}  icon="arrow-left" color='white' onFocus={()=>{router.push('/')}} />
    </View>
  );
}
