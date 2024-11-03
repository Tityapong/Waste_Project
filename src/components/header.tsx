'use client'
import { useState , useEffect, use } from "react"
import  Link from 'next/link'
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import {Menu, Coins ,Leaf , Search , Bell , User , ChevronDown, LogIn ,LogOut} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent , DropdownMenuItem, DropdownMenuTrigger } from  "./ui/dropdown-menu"

import { Badge } from "./ui/badge"
import {Web3Auth} from '@web3auth/modal'
import { CHAIN_NAMESPACES, IProvider , WEB3AUTH_NETWORK } from "@web3auth/base"
import {EthereumPrivateKeyProvider} from '@web3auth/ethereum-provider'
import { createUser, getUnreadNotifications, getUserBalance, getUserByEmail } from "@/utils/db/action"
// import {useMediaQuery} 

const clientId=process.env.WEB3_AUTH_CLIENT_ID

const chainConfig={
    chainNamespace:CHAIN_NAMESPACES.EIP155,
    chainId:'0xaa36a7', 
    rpcTarget:'https://rpc.ankr.com/eth_sepolia',
    displayName:'Sepolia Testnet',
    blockExplorerUrl: 'http://sepolia.etherscan.io',
    ticker:'ETH',
    tickerName:'Ethereum',
    logo:'https://assets.web3auth.io/evm-chains/sepolia.png',
}


const privateKeyProvider= new EthereumPrivateKeyProvider({
    config:chainConfig
})
const web3Auth=new Web3Auth({
    clientId,
    web3AuthNetwork:WEB3AUTH_NETWORK.TESTNET,
    privateKeyProvider
})
interface HeaderProps{
    onMenuClick:()=>void;
    totalEarning:number;
}

export default function Header({ onMenuClick,totalEarning}:HeaderProps){
    const [provider,setProvider]= useState<IProvider | null>(null)
    const [loggedIn,setLoggedIn]=useState(false)
    const [loading,setLoading]=useState(true)
    const [userInfo, setUserInfo]=useState<any>(null)
    const pathname=usePathname()
    const [notification,setNotification]=useState<Notification[]>([])
    const [balance,setBalance]=useState(0)

    useEffect(()=>{
        const init=async()=>{
            try{
                await web3Auth.initModal()
                setProvider(web3Auth.provider)
                if(web3Auth.connected){
                    setLoggedIn(true)
                    const user=await web3Auth.getUserInfo()
                    setUserInfo(user)
                    if(user.email){
                        localStorage.setItem('userEmail',user.email)
                        try{
                            await createUser(user.email, user.name || 'Anonymous user') 
                        }catch(e){
                            console.error( 'Error creating user', e)
                        }
                       
                    }
                   
                }

            }catch(e){
                console.error('Error initializing Web3Auth',e)

            }finally{
                setLoading(false)
            }
        }
        init()
    },[] )

    useEffect(()=>{
        const fetchNotifications= async ()=>{
            if(userInfo && userInfo.email){
                const user=await getUserByEmail(userInfo.email)
                if(user){
                    const unreadNotifications=await getUnreadNotifications(user.id)
                    setNotification(unreadNotifications)
                }

            }
        }
        fetchNotifications()
        const notificationInterval=setInterval(fetchNotifications,30000)
        return ()=>clearInterval(notificationInterval)
    },[userInfo])

    useEffect(()=>{
        const fetchUserBalance=async()=>{
            if(userInfo && userInfo.email){
                const user= await getUserByEmail(userInfo.email)
                if(user){
                    const userBalance= getUserBalance(user.id)
                    setBalance(userBalance)
                }
            }
        }
        fetchUserBalance()
        const handleBalanceUpdate=(event:CustomEvent)=>{
            setBalance(event.detail)
        }
        window.addEventListener('balanceUpdate',handleBalanceUpdate as EventListener)
        return ()=>window.removeEventListener('balanceUpdate',handleBalanceUpdate as EventListener)
    } ,[userInfo]  )




    //login
    const login = async ()=>{
        if(!web3Auth){
            console.error(' web3Auth is not initialized')
            return
        }
        try{
            const web3authProvider= await web3Auth.connect()
            setProvider(web3authProvider)
            setLoggedIn(true)
            const user=await web3Auth.getUserInfo()
            setUserInfo(user)
            if(user.email){
                localStorage.setItem('userEmail' , user.email)
                try{
                    await createUser(user.email, user.name || 'Anonymous user') 
                }catch(e){
                    console.error('Error creating user',e)
                }
            }

        }catch(error){
            console.error('Error logging in',error)
        }
    }

    const LogOut= async()=>{
        if(!web3Auth){
            console.error('web3Auth is not initialized')
            return
        }
        try{
            await web3Auth.logout()
            setProvider(null)
            setLoggedIn(false)
            setUserInfo(null)
            localStorage.removeItem('userEmail')
        }catch(error){
            console.error('Error logging out',error)
        }
    }


}

