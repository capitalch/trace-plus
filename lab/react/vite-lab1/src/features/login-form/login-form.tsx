import { useForm } from 'react-hook-form'
import axios from 'axios'
import qs from 'qs'

function LoginForm() {
    const { register, handleSubmit, formState } = useForm({ mode: 'onTouched' })
    const { errors } = formState

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="m-10 p-2 w-1/3 h-32 bg-slate-100 flex flex-col gap-3 items-center">
            <div className="flex flex-col items-center">
                <label className="w-36">User name: <input className="h-8" type="text" {...register('username', { required: true, })} /></label>
                {errors.name && errors.name.type === 'required' && (<p>Name is required</p>)}
            </div>
            <div className="flex flex-col items-center">
                <label className="w-36">Password:<input className="h-8" type="password" {...register('password', { required: true, minLength: 6 })} name='password' /></label>
                {errors.password ? (<p>password is required</p>) : <></>}
            </div>
            <button type="submit" className="w-auto px-2 rounded-sm bg-gray-400">Submit</button>
        </form>
    )

    async function onSubmit(data: any) {
        console.log(data);
        const url = 'http://localhost:8000/login'
        const dt = qs.stringify({
            username: data.username,
            password: data.password
        })
        try {
            const ret1: any = await axios.post(url, dt)
            // const ret2 = await axios.get('http://localhost:8000')
            // alert(ret2.data)

            // const ret = await axios({
            //     method: 'POST',
            //     url: url,
            //     data: dt,
            //     headers: {
            //         'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            //     }
            // })
            const { accessToken, refreshToken }: any = ret1.data
            alert(`${accessToken} ${refreshToken}`)
        } catch (err: any) {
            console.log(err)
        }
    }

}
export { LoginForm }